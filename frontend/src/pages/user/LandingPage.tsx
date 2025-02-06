import { ArrowRight, Heart, Users } from 'lucide-react';
import { FaHandHolding } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import helping_hand from '../../assets/helping_hand.jpg';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#435D2C] to-[#688D48] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Making a Difference Together
              </h1>
              <p className="text-lg mb-8">
                Connect, contribute, and create positive change in your community through our welfare management platform.
              </p>
              <div className="space-x-4">
                <Link to="/user/login" className="inline-flex items-center px-6 py-3 bg-white text-[#435D2C] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Login <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link to="/user/register" className="inline-flex items-center px-6 py-3 bg-[#435D2C] text-white rounded-lg font-semibold hover:bg-[#364B23] transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-full h-96 bg-white/10 rounded-lg flex items-center justify-center">
                <img src={helping_hand} alt="Helping Hands" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How You Can Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8 text-[#688D48]" />,
                title: "Donate",
                description: "Support those in need through monetary or resource donations"
              },
              {
                icon: <Users className="w-8 h-8 text-[#688D48]" />,
                title: "Volunteer",
                description: "Join our community of volunteers making a difference"
              },
              {
                icon: <FaHandHolding className="w-8 h-8 text-[#688D48]" />,
                title: "Request Help",
                description: "Seek assistance from our caring community"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#435D2C] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our community today and be part of the change. Sign up as a volunteer or user to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/user/login?role=volunteer" className="px-8 py-3 bg-white text-[#435D2C] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Join as Volunteer
            </Link>
            <Link to="/user/register" className="px-8 py-3 bg-[#688D48] text-white rounded-lg font-semibold hover:bg-[#577A3A] transition-colors">
              Sign Up as User
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                We're dedicated to connecting those in need with those who can help.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Welfare App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;