import { Link, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="MALAO Logo" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-2xl font-bold text-malao-orange">MALAO</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-malao-orange transition-colors">
                Accueil
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-malao-orange transition-colors">
                À propos
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-malao-orange transition-colors">
                Services
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-malao-orange transition-colors">
                Contact
              </Link>
              <Link 
                to="/login" 
                className="bg-malao-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-malao-orange-dark transition-colors"
              >
                Espace Client
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                to="/services" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/contact" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/login" 
                className="block px-4 py-2 bg-malao-orange text-white rounded font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Espace Client
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-malao-orange">MALAO COMPANY</h3>
              <p className="text-gray-400">
                La santé humaine et ses facteurs, notre priorité !
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-400 mb-2">📍 Linguère, Région de Louga, Sénégal</p>
              <p className="text-gray-400 mb-2">📞 +221 77 220 85 85</p>
              <p className="text-gray-400">✉️ contact@malaosarl.sn</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-malao-orange transition-colors">
                  Accueil
                </Link>
                <Link to="/about" className="block text-gray-400 hover:text-malao-orange transition-colors">
                  À propos
                </Link>
                <Link to="/services" className="block text-gray-400 hover:text-malao-orange transition-colors">
                  Services
                </Link>
                <Link to="/contact" className="block text-gray-400 hover:text-malao-orange transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MALAO COMPANY SARL. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}








