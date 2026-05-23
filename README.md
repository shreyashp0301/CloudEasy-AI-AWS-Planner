<div align="center">

# ☁️ CloudEasy

### 🚀 AI-Powered AWS Deployment Planner

CloudEasy turns simple natural language ideas into practical AWS deployment plans, Terraform starter code, security guidance, deployment workflows, and cost estimates in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-7C3AED?style=for-the-badge)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](#license)

</div>

---

## ✨ Overview

CloudEasy is built for developers, students, indie builders, and hackathon teams who want to deploy on AWS but do not want to spend hours piecing together architecture diagrams, Terraform snippets, IAM recommendations, cost tradeoffs, and deployment steps from scattered documentation.

Instead of starting with a blank page, users describe what they want to build:

> "Deploy a Next.js app with a backend API, PostgreSQL database, file uploads, HTTPS, and a low monthly AWS cost."

CloudEasy responds with a structured cloud deployment plan that is easy to understand, beginner-friendly when needed, and practical enough to become the first version of a real infrastructure workflow.

---

## 🎯 Problem Statement

AWS is powerful, but planning a deployment can feel overwhelming.

Developers often need to answer several questions before writing any infrastructure code:

- Which AWS services should this project use?
- How should the architecture be organized?
- What should be private, public, encrypted, cached, or load-balanced?
- What Terraform resources are needed?
- How much might the deployment cost?
- What security mistakes should be avoided early?

CloudEasy solves this by acting like a lightweight AI cloud architect. It helps users move from an idea to an actionable AWS deployment direction faster, with less confusion and fewer missed details.

---

## ⚡ Features

- AI-generated AWS architecture guidance from natural language prompts
- Terraform starter code for common infrastructure patterns
- Step-by-step deployment workflows for beginners and advanced users
- Security recommendations covering IAM, networking, encryption, secrets, and HTTPS
- Infrastructure cost estimate guidance for AWS service choices
- Beginner mode for simpler explanations and clearer learning paths
- Clean SaaS-style interface built with Next.js, TypeScript, and TailwindCSS
- OpenRouter-powered AI generation through a server-side API route

---

## 🧠 Example Prompt And Output

### Example Prompt

```text
I want to deploy a full-stack Next.js app on AWS with a Node.js API,
PostgreSQL database, image uploads, HTTPS, and autoscaling.
Keep the setup beginner-friendly and cost-conscious.
```

### Example CloudEasy Output

```text
Recommended Architecture:
- Amazon ECS Fargate for the app and API containers
- Amazon RDS PostgreSQL for the relational database
- Amazon S3 for image uploads and static assets
- Amazon CloudFront for global content delivery
- Application Load Balancer for HTTPS traffic
- AWS Certificate Manager for SSL/TLS certificates
- Secrets Manager for API keys and database credentials

Terraform Starter Plan:
- Create a VPC with public and private subnets
- Deploy ECS services behind an Application Load Balancer
- Provision RDS PostgreSQL in private subnets
- Create an S3 bucket for uploads
- Attach least-privilege IAM roles

Security Notes:
- Keep RDS private
- Use HTTPS everywhere
- Store secrets in AWS Secrets Manager
- Avoid hardcoding credentials
- Restrict S3 bucket access

Estimated Monthly Cost:
- Small production setup: approximately $45-$120/month
- Lower-cost prototype setup: approximately $15-$40/month
```

---

## 🏗️ Architecture Overview

CloudEasy keeps the product simple and focused:

```text
User Prompt
   |
   v
Next.js Frontend
   |
   v
Next.js API Route
   |
   v
OpenRouter AI
   |
   v
Structured AWS Deployment Plan
```

### How It Works

1. The user enters a deployment goal in plain English.
2. The frontend sends the prompt to the CloudEasy API route.
3. The API route securely calls OpenRouter with the project context.
4. The AI response is returned as an AWS-focused deployment plan.
5. The user receives architecture guidance, Terraform direction, deployment steps, security notes, and cost estimates.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js |
| Language | TypeScript |
| Styling | TailwindCSS |
| AI Provider | OpenRouter AI |
| Runtime | Node.js |
| Package Manager | npm |

---

## 📸 Screenshots

> Replace these placeholders with real screenshots before submitting or publishing.

### Home / Prompt Builder

![CloudEasy home screen placeholder](./public/screenshots/cloudeasy-home.png)

### Generated AWS Deployment Plan

![CloudEasy generated plan placeholder](./public/screenshots/cloudeasy-result.png)

### Beginner-Friendly Explanation Mode

![CloudEasy beginner mode placeholder](./public/screenshots/cloudeasy-beginner-mode.png)

---

## 📦 Installation

### Prerequisites

Make sure you have the following installed:

- Node.js 20 or newer
- npm
- An OpenRouter API key

### Clone The Repository

```bash
git clone <your-repository-url>
cd cloudeasy
```

### Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

You can get an API key from [OpenRouter](https://openrouter.ai/).

> Keep this key private. Do not commit `.env.local` to GitHub.

---

## 💻 Local Development

Start the development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

### Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 🎥 Demo Video

Add your hackathon demo video here:

[![Watch the CloudEasy demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://example.com)

Suggested demo flow:

- Show a natural language AWS deployment prompt
- Generate a cloud architecture plan
- Walk through the Terraform and security recommendations
- Highlight the cost estimate and beginner-friendly explanation
- End with why CloudEasy helps developers ship faster

---

## 🚧 Future Improvements

- Visual AWS architecture diagrams
- Export generated Terraform files as downloadable projects
- One-click deployment workflow generation
- AWS pricing API integration for more accurate estimates
- Support for multiple cloud providers
- Prompt history and saved deployment plans
- Team collaboration workspaces
- GitHub integration for infrastructure pull requests
- More AI model options through OpenRouter

---

## 👤 Creator

Built by **Tejas** for the **DoraHacks AWS Prompt Planet Challenge**.

CloudEasy was created with a simple goal: make AWS deployment planning feel less intimidating and more actionable for every developer.

---

## 📄 License

This project is licensed under the MIT License.

You are free to use, modify, and share it for learning, experimentation, and future development.
