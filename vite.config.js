import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 👈 これがあることで、GitHub PagesでURLを開いたときに画面が真っ白になるのを防ぎます！
})