export default function ServicesPage() {
  const directions = [
    {
      name: 'MALAO HEALTH',
      icon: '🏥',
      description: 'Services de santé complets pour la communauté',
      services: [
        { name: 'MALAO Clinic', desc: 'Services médicaux et consultations' },
        { name: 'MALAO Pharmacy', desc: 'Pharmacie et produits pharmaceutiques' },
        { name: 'Services santé', desc: 'Soins et prévention' }
      ]
    },
    {
      name: 'MALAO AGRO',
      icon: '🌾',
      description: 'Production agricole et alimentation animale',
      isMain: true,
      services: [
        { name: 'Production Aliments', desc: 'Aliments pour bétail, volaille et poisson' },
        { name: 'Ferme & Élevage', desc: 'Agriculture et élevage durable' },
        { name: 'Restauration', desc: 'Restaurant africain avec produits locaux' },
        { name: 'Transformation', desc: 'Transformation des produits agricoles' },
        { name: 'Équipements', desc: 'Vente d\'équipements agricoles et IoT' }
      ]
    },
    {
      name: 'MALAO ENERGIES',
      icon: '⚡',
      description: 'Solutions énergétiques durables',
      services: [
        { name: 'Home Appliance', desc: 'Électroménager' },
        { name: 'Solar Energy', desc: 'Énergie solaire et renouvelable' },
        { name: 'Services énergétiques', desc: 'Conseil et installation' }
      ]
    },
    {
      name: 'MALAO TRANSPORTS',
      icon: '🚚',
      description: 'Transport et logistique',
      services: [
        { name: 'Transport', desc: 'Services de transport' },
        { name: 'Logistique', desc: 'Gestion logistique complète' },
        { name: 'Livraisons', desc: 'Livraison de produits MALAO' }
      ]
    },
    {
      name: 'MALAO DISCOVERY',
      icon: '🌟',
      description: 'Événements et actions communautaires',
      services: [
        { name: 'Événements', desc: 'Organisation d\'événements' },
        { name: 'Actions communautaires', desc: 'Puits, forage, distribution' }
      ]
    },
    {
      name: 'MALAO SOCIO-EDUCATIONAL',
      icon: '📚',
      description: 'Éducation et soutien social',
      services: [
        { name: 'Éducation', desc: 'Formation et éducation' },
        { name: 'Social', desc: 'Soutien et assistance sociale' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-malao-orange">Nos Services</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Découvrez nos six directions et les services que nous proposons
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {directions.map((direction, index) => (
            <div 
              key={index}
              className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                direction.isMain ? 'border-4 border-malao-orange' : ''
              }`}
            >
              <div className="text-6xl mb-4">{direction.icon}</div>
              <h2 className="text-2xl font-bold text-malao-orange mb-2">
                {direction.name}
                {direction.isMain && <span className="text-sm text-gray-600 ml-2">⭐</span>}
              </h2>
              <p className="text-gray-600 mb-4">{direction.description}</p>
              
              <div className="space-y-3">
                {direction.services.map((service, i) => (
                  <div key={i} className="border-l-4 border-malao-green pl-3">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}








