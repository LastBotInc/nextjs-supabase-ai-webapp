import React from 'react';
// import Balancer from 'react-wrap-balancer'; // Removed import

const InnoleaseAdvantageMessage = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 my-8 rounded-xl shadow-sm">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose Innolease for Your Fleet Needs?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Tailored Solutions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tailored Leasing Solutions</h3>
            <p className="text-gray-700">
              We understand every business is unique. Innolease offers flexible leasing options (Financial, Flexible, Maintenance, MiniLeasing) customized to fit your specific operational requirements and budget, ensuring optimal cost-efficiency.
            </p>
          </div>

          {/* Card 2: Digital Fleet Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Fleet Management</h3>
            <p className="text-gray-700">
              Simplify your operations with InnoFleet Manager. Gain full visibility into contracts, vehicles, costs, and usage data through our user-friendly digital platform, empowering data-driven decisions.
            </p>
          </div>

          {/* Card 3: Transparent & Predictable Costs */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent & Predictable Costs</h3>
            <p className="text-gray-700">
              Benefit from clear, upfront pricing with no hidden fees. Our various leasing models, including maintenance leasing, offer predictable monthly costs for easier budgeting and financial planning.
            </p>
          </div>

          {/* Card 4: Nationwide Coverage & Support */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Nationwide Coverage & Support</h3>
            <p className="text-gray-700">
              As part of Autolle.com Group, we leverage a network of over 800 service points across Finland. Receive reliable maintenance and support wherever your business operates, managed by your dedicated account manager.
            </p>
          </div>

          {/* Card 5: Focus on Efficiency */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Focus on Efficiency</h3>
            <p className="text-gray-700">
              Our goal is to streamline your fleet operations. From optimized vehicle selection advice to handling administrative tasks, we help you reduce overhead and improve overall fleet efficiency.
            </p>
          </div>

          {/* Card 6: Partnering for Growth */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Partnering for Growth</h3>
            <p className="text-gray-700">
              We act as a collaborative partner, adapting our services as your business evolves. Trust Innolease to provide scalable and reliable mobility solutions that support your company's growth journey.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
           <p className="text-lg text-gray-800">
             Ready to optimize your business mobility? Contact Innolease today for a personalized consultation.
           </p>
           {/* Optionally add a CTA button here */}
        </div>

      </div>
    </div>
  );
};

export default InnoleaseAdvantageMessage; 