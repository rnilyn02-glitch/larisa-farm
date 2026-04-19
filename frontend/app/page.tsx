export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Добро пожаловать в Larisa Farm
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Свежие фермерские продукты с доставкой на дом
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Свежие яйца</h2>
            <p className="text-gray-600">Домашние куриные яйца</p>
            <p className="text-lg font-bold mt-2">120 ₽ / 10 шт</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Домашняя курица</h2>
            <p className="text-gray-600">Свежее мясо</p>
            <p className="text-lg font-bold mt-2">450 ₽ / кг</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Фермерский набор</h2>
            <p className="text-gray-600">Ассорти продуктов</p>
            <p className="text-lg font-bold mt-2">1500 ₽ / набор</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500">
            API доступен по адресу: {process.env.NEXT_PUBLIC_API_URL || 'https://api.ramirezi1.online'}
          </p>
        </div>
      </div>
    </main>
  )
}
