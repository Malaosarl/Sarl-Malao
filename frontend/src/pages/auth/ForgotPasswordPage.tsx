import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage(
        'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation par email.'
      );
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-malao-orange to-malao-orange-dark">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="MALAO Logo" 
            className="mx-auto mb-4 h-20 w-auto object-contain"
          />
          <h1 className="text-3xl font-bold text-malao-orange mb-2">MALAO</h1>
          <p className="text-gray-600">Réinitialisation du mot de passe</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              placeholder="votre.email@malao.sn"
            />
            <p className="mt-2 text-sm text-gray-500">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-malao-orange text-white py-2 px-4 rounded-lg hover:bg-malao-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-malao-orange hover:text-malao-orange-dark hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}






