import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { BibleReaderPage } from "@/features/bible/BibleReaderPage";
import { HomePage } from "@/features/home/HomePage";
import { SaintDetailPage } from "@/features/saints/SaintDetailPage";
import { SearchPage } from "@/features/search/SearchPage";
import { AuthorsPage } from "@/features/authors/AuthorsPage";
import { AuthorDetailPage } from "@/features/authors/AuthorDetailPage";
import { DiscoveryListPage } from "@/features/discovery/DiscoveryListPage";
import { DiscoveryDetailPage } from "@/features/discovery/DiscoveryDetailPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/bible" element={<BibleReaderPage />} />
        <Route path="/bible/:book" element={<BibleReaderPage />} />
        <Route path="/bible/:book/:chapter" element={<BibleReaderPage />} />
        <Route path="/saints/:slug" element={<SaintDetailPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/authors/:slug" element={<AuthorDetailPage />} />
        <Route path="/topics" element={<DiscoveryListPage />} />
        <Route path="/topics/:slug" element={<DiscoveryDetailPage />} />
        <Route path="/tags" element={<DiscoveryListPage />} />
        <Route path="/tags/:slug" element={<DiscoveryDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
