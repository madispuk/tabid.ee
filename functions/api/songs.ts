interface Env {
  SONGS_KV: KVNamespace;
  TURNSTILE_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      content?: string;
      token?: string;
    };
    const content = body?.content?.trim();
    const token = body?.token;

    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!token) {
      return new Response(JSON.stringify({ error: "Turnstile token missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Turnstile token
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: context.env.TURNSTILE_SECRET,
          response: token,
          remoteip: context.request.headers.get("CF-Connecting-IP") || "",
        }),
      },
    );
    const verify = (await verifyRes.json()) as { success: boolean };

    if (!verify.success) {
      return new Response(JSON.stringify({ error: "Turnstile verification failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const key = `song:${now}`;
    await context.env.SONGS_KV.put(
      key,
      JSON.stringify({ content, createdAt: new Date(now).toISOString() }),
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
