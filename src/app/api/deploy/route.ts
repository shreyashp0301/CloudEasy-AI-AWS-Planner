import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, beginner } = body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              beginner
                ? 'You are an AWS deployment assistant for beginners. Explain simply with architecture, cost, security, Terraform example, and step-by-step deployment.'
                : 'You are an advanced AWS cloud architect. Give production-ready AWS deployment plans with Terraform, security best practices, scaling, and optimization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
  result: data.choices[0].message.content,
});
  } catch {
    return NextResponse.json({
      result: 'Error generating deployment plan.',
    });
  }
}
