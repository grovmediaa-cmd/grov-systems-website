export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();

    if (!payload?.email) {
      return Response.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const webhookUrl = context.env.GHL_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json({ ok: false, error: "Webhook is not configured." }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return Response.json(
        { ok: false, error: "GHL webhook rejected the request.", status: response.status },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }
}