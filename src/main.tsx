import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Intro } from './components/Intro'
import { Layout } from './components/Layout'
import { routerBase } from './lib/url'
import { About } from './pages/About'
import { AdminHome } from './pages/admin/AdminHome'
import { Home } from './pages/Home'
import { Journal } from './pages/Journal'
import { JournalPost } from './pages/JournalPost'
import { NotFound } from './pages/NotFound'
import { Photography } from './pages/Photography'
import { PhotoSeries } from './pages/PhotoSeries'
import { ResourceDetail } from './pages/ResourceDetail'
import { Resources } from './pages/Resources'
import { WorkDetail } from './pages/WorkDetail'
import { Works } from './pages/Works'
import './styles/tokens.css'
import './styles/fonts.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Intro />
    <BrowserRouter basename={routerBase}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="works" element={<Works />} />
          <Route path="works/:slug" element={<WorkDetail />} />
          <Route path="photography" element={<Photography />} />
          <Route path="photography/:slug" element={<PhotoSeries />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<JournalPost />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:slug" element={<ResourceDetail />} />
          <Route path="about" element={<About />} />
          <Route path="admin/*" element={<AdminHome />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
