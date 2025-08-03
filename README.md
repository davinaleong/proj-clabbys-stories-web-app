# ✏️ Clabby's Stories Editor

This is the **Editor interface** for the Clabby's Stories project. It is a modern web app built with **Next.js 15 App Router**, **Tailwind CSS**, **Apollo Client**, and **Drag-and-Drop utilities**. Editors can manage galleries, arrange photos, and configure privacy and display settings through a responsive and intuitive UI.

---

## ⚙️ Features

- 🔐 Secure login via magic link
- 📁 Gallery and photo organization
- 🔒 Private galleries with passphrase protection
- 🧩 Drag-and-drop sorting (powered by `@dnd-kit`)
- 🎨 Tailwind CSS for fast and responsive styling
- 🔌 GraphQL integration via Apollo Client

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/your-username/proj-clabby-stories-editor.git
cd proj-clabby-stories-editor
npm install
```

### 2. Setup Environment Variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with the required API URLs and keys.

---

## 🧪 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint checks        |

---

## 📁 Folder Structure

```txt
src/app/
├── assets/         # Static assets
├── components/     # UI components
├── db/             # Local data and queries
├── editor/         # Pages and logic for editor
├── lib/            # Utility libraries
├── privacy/        # Privacy-related pages
├── utils/          # General utility functions
```

---

## 📦 Built With

- [Next.js 15](https://nextjs.org)
- [React 19](https://react.dev)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Tailwind CSS](https://tailwindcss.com)
- [Day.js](https://day.js.org)
- [@dnd-kit](https://dndkit.com/)

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) © Davina Leong.

---

## ✨ Author

**Davina Leong** — [GitHub](https://github.com/your-username)
