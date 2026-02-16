import { Link } from 'react-router-dom';

export default function HomePage() {
  const directions = [
    {
      name: 'MALAO HEALTH',
      services: ['MALAO Clinic', 'MALAO Pharmacy', 'Services santé'],
      icon: '🏥'
    },
    {
      name: 'MALAO AGRO',
      services: ['Production Aliments', 'Ferme & Élevage', 'Transformation', 'Équipements'],
      icon: '🌾',
      isMain: true
    },
    {
      name: 'MALAO ENERGIES',
      services: ['Home Appliance', 'Solar Energy', 'Services énergétiques'],
      icon: '⚡'
    },
    {
      name: 'MALAO TRANSPORTS',
      services: ['Transport', 'Logistique', 'Livraisons'],
      icon: '🚚'
    },
    {
      name: 'MALAO DISCOVERY',
      services: ['Événements', 'Actions communautaires'],
      icon: '🌟'
    },
    {
      name: 'MALAO SOCIO-EDUCATIONAL',
      services: ['Éducation', 'Social', 'Formation'],
      icon: '📚'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {}
      <section className="bg-gradient-to-br from-malao-orange to-malao-orange-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="/logo.jpg" 
            alt="MALAO Logo" 
            className="mx-auto mb-6 h-32 w-auto object-contain"
          />
          <h1 className="text-5xl font-bold mb-4">MALAO COMPANY SARL</h1>
          <p className="text-xl mb-8">La santé humaine et ses facteurs, notre priorité !</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Groupe multidisciplinaire opérant dans six directions principales, 
            toutes centrées autour de la santé humaine et ses facteurs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/contact" 
              className="bg-white text-malao-orange px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Nous contacter
            </Link>
            <Link 
              to="/login" 
              className="bg-malao-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-malao-green-dark transition-colors"
            >
              Espace Client
            </Link>
          </div>
        </div>
      </section>

      {/* Directions Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Nos Six Directions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {directions.map((direction, index) => (
              <div 
                key={index}
                className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                  direction.isMain ? 'border-4 border-malao-orange' : ''
                }`}
              >
                <div className="text-5xl mb-4">{direction.icon}</div>
                <h3 className="text-2xl font-bold text-malao-orange mb-3">
                  {direction.name}
                  {direction.isMain && <span className="text-sm text-gray-600 ml-2">⭐</span>}
                </h3>
                <ul className="space-y-2">
                  {direction.services.map((service, i) => (
                    <li key={i} className="text-gray-700">• {service}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Notre Vision</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-malao-green/10 p-6 rounded-lg">
                <h3 className="font-bold text-malao-green mb-3">Autonomie Alimentaire</h3>
                <p className="text-gray-700">Réduire la dépendance aux importations et promouvoir la production locale</p>
              </div>
              <div className="bg-malao-orange/10 p-6 rounded-lg">
                <h3 className="font-bold text-malao-orange mb-3">Innovation</h3>
                <p className="text-gray-700">Connecter tous les maillons de la chaîne avec des solutions modernes</p>
              </div>
              <div className="bg-malao-green/10 p-6 rounded-lg">
                <h3 className="font-bold text-malao-green mb-3">Emploi & Formation</h3>
                <p className="text-gray-700">Créer des emplois et former les éleveurs et agriculteurs</p>
              </div>
              <div className="bg-malao-orange/10 p-6 rounded-lg">
                <h3 className="font-bold text-malao-orange mb-3">Développement Durable</h3>
                <p className="text-gray-700">Promouvoir la durabilité et la transition écologique</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}








