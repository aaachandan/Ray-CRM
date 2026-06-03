# Ray CRM 🚀

आपका अपना **कस्टम CRM** — Branding, Marketing, Repairing, Website, Loan, Property, Photography, Solar — सबके लिए एक ही जगह।

## 🎯 Features

| Module | काम |
|--------|------|
| **Lead Management** | हर सर्विस (branding, marketing, website, loan, etc.) के लिए अलग-अलग लीड्स जोड़ें, सर्च करें, फ़िल्टर करें |
| **Call Tracking** | हर लीड की कॉल हिस्ट्री रखें — incoming/outgoing |
| **WhatsApp Messages** | लीड को मैसेज भेजें और सारी बातचीत सेव रहे |
| **Follow-up Reminders** | रिमाइंडर सेट करें, कभी कोई लीड फ़ॉलो-अप न छूटे |
| **Team Dashboard** | 5 लोग एक साथ काम करें — admin और agents |
| **Reports & Analytics** | कितने लीड्स, किस सर्विस में, किस स्टेटस में — पूरा चार्ट |

## 🛠️ Tech Stack

- **Backend:** Node.js + Express + SQLite
- **Frontend:** React + Vite + Tailwind CSS
- **Charts:** Recharts
- **Auth:** JWT

## 🏃 Locally Run करें

### Backend
```bash
cd backend
cp .env.example .env
npm install
node server.js
```
Server चलेगा `http://localhost:5000` पर

### Frontend
```bash
cd frontend
npm install
npx vite
```
Frontend चलेगा `http://localhost:3000` पर

### या एक साथ
```
powershell -File start.ps1
```

## 🌐 Free Deployment (Render)

1. **[Render.com](https://render.com)** पर अकाउंट बनाएं (free)
2. **New Web Service** बनाएं — अपना GitHub repo connect करें
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Environment Variable डालें:
   - `JWT_SECRET` = कोई भी secret key
5. Deploy करें — backend URL मिलेगा
6. Frontend के `vite.config.js` में proxy URL अपडेट करें
7. Frontend के लिए **Static Site** बनाएं:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

## 👥 Team Setup

1. पहला user **Register** करेगा — वह admin बनेगा
2. Admin Team page से और members add करे — agent role से
3. Lead बनाते वक्त **Service** select करें: branding / marketing / repairing / website / loan / property / photography / solar
4. Team members अपने-अपने लीड्स देख और मैनेज कर सकते हैं

## 📁 GitHub Repo

```
https://github.com/aaachandan/Ray-CRM
```
