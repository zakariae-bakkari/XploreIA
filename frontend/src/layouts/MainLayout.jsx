import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <div className="light-leak-1"></div>
      <div className="light-leak-2"></div>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
