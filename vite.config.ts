import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          
          // Radix UI компоненты
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui'
          }
          
          // Графики и визуализация
          if (id.includes('node_modules/d3') || 
              id.includes('node_modules/recharts')) {
            return 'vendor-charts'
          }
          
          // Формы и валидация
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform/resolvers') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms'
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase/') ||
              id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-supabase'
          }
          
          // Excel и утилиты
          if (id.includes('node_modules/exceljs') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/sonner') ||
              id.includes('node_modules/framer-motion')) {
            return 'vendor-utils'
          }
          
          // Icons
          if (id.includes('node_modules/@phosphor-icons/')) {
            return 'vendor-icons'
          }
        }
      }
    },
    // Увеличим лимит для chunk warnings
    chunkSizeWarningLimit: 600,
  }
});
