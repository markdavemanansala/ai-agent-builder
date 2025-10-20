# AI Agent Builder MVP

A no-code platform for building and deploying AI agents using multiple LLM providers.

## 🚀 Live Demo

**Frontend**: [https://ai-agent-builder.vercel.app](https://ai-agent-builder.vercel.app)  
**Backend**: [https://ai-agent-builder-api.railway.app](https://ai-agent-builder-api.railway.app)

## ✨ Features

- **🎨 No-Code Agent Builder**: Drag-and-drop interface for creating AI agents
- **🤖 Multi-LLM Support**: Choose between GPT-4, Claude, Gemini via OpenRouter
- **📱 Agent Templates**: Pre-built templates for common use cases
- **💬 Real-time Testing**: Test your agents with live chat interface
- **🌐 Public Sharing**: Deploy agents with public URLs
- **👤 User Management**: Secure authentication with Supabase
- **📊 Analytics**: Track usage and performance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenRouter API (Multi-LLM)
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-agent-builder.git
   cd ai-agent-builder
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `frontend/env.example` to `frontend/.env`
   - Copy `backend/env.example` to `backend/.env`
   - Fill in your Supabase and API keys

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Open** `http://localhost:3000`

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_jwt_secret
```

## 🎯 MVP Success Metrics

- ✅ **Time to create agent**: < 10 minutes
- ✅ **Beautiful UI**: Modern, responsive design
- ✅ **No-code interface**: Drag-and-drop builder
- ✅ **Multi-LLM support**: Model selection
- ✅ **Agent templates**: Pre-built examples
- ✅ **Test interface**: Real-time chat
- ✅ **Public sharing**: Ready for deployment

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy automatically

## 📁 Project Structure

```
ai-agent-builder/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
├── database/          # Database schema
└── vercel.json        # Vercel configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or support, please open an issue on GitHub.