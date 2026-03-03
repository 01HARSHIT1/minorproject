# UPES MyUPES Portal Setup

The project is configured to work with the **official UPES student portal**.

## Portal URLs

| Purpose | URL |
|---------|-----|
| **Login** | https://myupes-beta.upes.ac.in/oneportal/app/auth/login |
| **Dashboard** | https://myupes-beta.upes.ac.in/connectportal/user/student/home/dashboard |

## How to Connect

1. **Register/Login** to the Student Gateway app
2. Go to **Dashboard** → **Connect your first portal** (or **Connect Portal**)
3. Select **UPES (University of Petroleum and Energy Studies)**
4. Enter your credentials:
   - **College ID / Email**: Your UPES email (e.g. `Harshit.122504@stu.upes.ac.in`)
   - **Password**: Your portal password
5. Click **Connect Portal**

Your credentials are **encrypted with AES-256** and stored securely. They are never exposed to the frontend or AI.

## What the AI Can Do

- **Monitor** your portal (attendance, assignments, exams, notices)
- **Notify** you when new assignments or updates appear
- **AI Supervisor** suggests approaches for assignments (you approve before any action)
- **Submit assignments** – only after you approve and upload your file

## Security

- Never share your portal credentials in code or chat
- Credentials are entered only through the Connect Portal form
- Change your password if you've exposed it anywhere
