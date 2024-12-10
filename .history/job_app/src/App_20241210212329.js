import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs'; // 검색 아이콘 가져오기
import './App.css';
import Archive from './Archive/Archive';
import Generator from './Generator/Generator';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/fonts.css';

function Navigation() {
  const location = useLocation(); // 현재 경로를 가져오기

  return (
    <Navbar expand="lg" bg="black" data-bs-theme="dark">
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
  return (
    <Router>
      <div className="app-container">
        <Navigation /> {/* 네비게이션 컴포넌트 사용 */}
        <Container className="content">
          <Routes>
            {/* 기본 경로로 이동 시 /generator로 리디렉션 */}
            <Route path="/" element={<Navigate to="/generator" />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/generator" element={<Generator />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
