# 🏙️ Smart Civic Reporter
 
A full-stack web application that empowers citizens to report local civic issues — potholes, broken streetlights, garbage, drainage problems, and more — and track them through resolution in real time. Authorities receive complaints, update statuses, and the reporter gets notified by email at every step.
 
---
 
## ✨ Features
 
- **Submit Complaints** — Citizens can file civic complaints with details and a unique complaint ID is assigned automatically.
- **Real-Time Status Tracking** — Each complaint moves through a clear lifecycle: `Accepted → In Progress → Resolved` (or `Rejected` / `Pending Verification`).
- **Email Notifications** — Automated emails via Nodemailer (SMTP/Gmail) keep the reporter informed at every status change.
- **Admin Dashboard** — Authorities can view all complaints, update statuses, and manage the queue.
- **Separate Frontend & Backend** — Clean separation of concerns with a dedicated React frontend and Node.js/Express backend.
---
 
## 🗂️ Project Structure
 
```
Smart-Civic-Reporter/
├── backend/          # Node.js + Express REST API
│   ├── node_modules/
│   └── ...           # Routes, controllers, email service, DB models
├── frontend/         # React web app (citizen & admin views)
│   └── ...
├── test_email.js     # Standalone script to test SMTP email delivery
└── email_debug.log   # Local log of all email dispatch attempts
```
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Email | Nodemailer (Gmail SMTP) |
| Language | JavaScript (99.7%) |
 
---
 
## 🚀 Getting Started
 
### Prerequisites
 
- Node.js v18+ and npm
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled (for SMTP)
### 1. Clone the repository
 
```bash
git clone https://github.com/gouni-pranav-charan/Smart-Civic-Reporter.git
cd Smart-Civic-Reporter
```
 
### 2. Set up the Backend
 
```bash
cd backend
npm install
```
 
Create a `.env` file in the `backend/` directory:
 
```env
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
 
> ⚠️ Use a **Gmail App Password**, not your regular account password. Regular passwords will be rejected by Google's SMTP server.
 
Start the backend server:
 
```bash
node server.js
```
 
### 3. Set up the Frontend
 
```bash
cd ../frontend
npm install
npm start
```
 
The app will be available at `http://localhost:3000`.
 
---
 
## 📧 Email Notifications
 
The system sends automated emails to the complaint reporter whenever an authority updates the complaint status. The supported statuses and their triggers are:
 
| Status | Email Subject |
|---|---|
| Accepted | `[Accepted] Your Civic Complaint #N` |
| In Progress | `[In Progress] Update on Your Civic Complaint #N` |
| Pending Verification | `[Pending Verification] Your Civic Complaint #N` |
| Resolved | `[Resolved] Your Civic Complaint #N` |
| Rejected | `[Rejected] Update on Your Civic Complaint #N` |
 
To test the email setup independently, run:
 
```bash
node test_email.js
```
 
All email attempts (successes and failures) are logged to `email_debug.log`.
 
---
 
## 🔄 Complaint Lifecycle
 
```
Submitted
    │
    ▼
Accepted  ──────────────────────────────────────► Rejected
    │
    ▼
In Progress
    │
    ▼
Pending Verification
    │
    ▼
Resolved ✅
```
 
---
 
## 🤝 Contributing
 
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
 
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
---
 
## 👤 Team
 
**Pranav Charan Teja Gouni**
- GitHub: [@gouni-pranav-charan](https://github.com/gouni-pranav-charan)
**Vineeth Bandari**
- GitHub: [@vineethbandari20-a11y](https://github.com/vineethbandari20-a11y)
**BalReddy**
- GitHub: [@balu2412](https://github.com/balu2412)
---
 
## 📄 License
 
This project is open source. Feel free to use and adapt it for civic tech, hackathons, or community projects.
 
