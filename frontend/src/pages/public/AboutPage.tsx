export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-malao-orange">
            À Propos de MALAO
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Notre Histoire</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>MALAO COMPANY SARL</strong> a été créée le <strong>16 Mai 2022</strong> à Linguère, 
                dans la Région de Louga, Sénégal. Fondée par Dieynaba NDIAYE, ingénieure en Génie Électrique 
                Informatique et Industrielle, spécialisée en Transition Écologique des Entreprises.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Notre Mission</h2>
              <p className="text-2xl font-bold text-malao-orange mb-4">
                "La santé humaine et ses facteurs, notre priorité !"
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nous œuvrons pour faire face à l'insuffisance alimentaire, améliorer les conditions 
                socio-économiques, promouvoir la consommation locale, créer des emplois et décentraliser 
                l'activité économique du Sénégal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Nos Valeurs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-malao-orange mb-2">Excellence</h3>
                  <p className="text-gray-700">Nous visons l'excellence dans tous nos services</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-malao-green mb-2">Qualité</h3>
                  <p className="text-gray-700">La qualité est au cœur de nos préoccupations</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-malao-orange mb-2">Innovation</h3>
                  <p className="text-gray-700">Nous innovons pour un meilleur avenir</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-malao-green mb-2">Communauté</h3>
                  <p className="text-gray-700">Nous servons notre communauté avec engagement</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Localisation</h2>
              <p className="text-gray-700">
                <strong>Linguère, Région de Louga, Sénégal</strong><br />
                Située à 305 km au nord-est de Dakar, dans le Ferlo, 
                une zone sylvo-pastorale semi-désertique.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Téléphone :</strong> +221 77 220 85 85
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Email :</strong> contact@malaosarl.sn
                </p>
                <p className="text-gray-700">
                  <strong>Site web :</strong> www.malao.sn
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}








