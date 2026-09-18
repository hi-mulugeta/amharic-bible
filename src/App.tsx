import { useEffect } from "react";
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
import { SettingsPage } from "@/features/settings/SettingsPage";
import { LibraryPage } from "@/features/library/LibraryPage";
import { LiturgyPage } from "@/features/liturgy/LiturgyPage";
import { LiturgyPrayerDetailPage } from "@/features/liturgy/LiturgyPrayerDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { useReaderStore } from "@/stores/readerStore";

export default function App() {
  const theme = useReaderStore((s) => s.theme);

  // Apply theme class to <html> for CSS variable scoping
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-stone", "theme-parchment", "theme-midnight");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/liturgy" element={<LiturgyPage />} />
        <Route
          path="/liturgy/prayers/:slug"
          element={<LiturgyPrayerDetailPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
