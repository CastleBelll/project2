import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import './App.css';
import Archive from './Archive/Archive';
import ArchiveInfo from './Archive/ArchiveInfo'; // ArchiveInfo 컴포넌트 추가
import Generator from './Generator/Generator';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/fonts.css';

function Navigation() {
  const location = useLocation(); // 현재 경로를 가져오기

  return (
    <Navbar expand="lg">
      <Navbar.Collapse id="navbarNav">
        <Nav className="nav-links">
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/generator"
              className={`nav-link ${location.pathname === '/generator' ? 'active' : ''}`}
            >
              Generator
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to="/archive"
              className={`nav-link ${location.pathname === '/archive' ? 'active' : ''}`}
            >
              Archive
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
      <div className="search-icon">
        <BsSearch />
      </div>
    </Navbar>
  );
}

function App() {
  const location = useLocation();
  const [selectedImageInfo, setSelectedImageInfo] = useState(null); // 선택된 이미지 정보 상태 추가

  useEffect(() => {
    // Archive 경로일 때 body에 'archive-active' 클래스를 추가
    if (location.pathname === '/archive') {
      document.body.classList.add('archive-active');
    } else {
      document.body.classList.remove('archive-active');
    }
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Navigation /> {/* 네비게이션 컴포넌트 사용 */}
      <Container className="content">
        <Routes>
          {/* 기본 경로로 이동 시 /generator로 리디렉션 */}
          <Route path="/" element={<Navigate to="/generator" />} />
          <Route path="/archive" element={<Archive setSelectedImageInfo={setSelectedImageInfo} />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/archive-info" element={<ArchiveInfo selectedImageInfo={selectedImageInfo} />} /> {/* ArchiveInfo 라우트 추가 */}
        </Routes>
      </Container>
    </div>
  );
}

export default function MainApp() {
  return (
    <Router>
      <App /> {/* App 컴포넌트는 이제 Router 내부에 위치 */}
    </Router>
  );
}
