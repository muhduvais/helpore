import { ArrowRight, Heart, Users, Mail, Phone, MapPin } from 'lucide-react';
import { FaHandHolding } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import helping_hand from '../../assets/helping_hand.jpg';
import logo from '../../assets/Logo-black.png';

const LandingPage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logo} alt="Welfare App Logo" className="h-10 w-auto" />
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#435D2C] transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-[#435D2C] transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#435D2C] transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#435D2C] transition-colors">
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/user/login" className="text-[#435D2C] hover:text-[#688D48] font-semibold">
                Login
              </Link>
              <Link to="/user/register" className="px-4 py-2 bg-[#435D2C] text-white rounded-lg font-semibold hover:bg-[#364B23] transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="bg-gradient-to-r from-[#435D2C] to-[#688D48] text-white">
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
      <section id="features" className="py-16">
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

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">About Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We are a dedicated welfare management platform committed to bridging the gap between those who need help and those who can provide it. Our mission is to create a compassionate community where everyone has access to the support they need.
              </p>
              <p className="text-gray-600 mb-4">
                Through our platform, we facilitate meaningful connections between volunteers, donors, and individuals seeking assistance. We believe that by working together, we can create lasting positive change in our communities.
              </p>
              <p className="text-gray-600">
                Our team is passionate about social welfare and is committed to transparency, efficiency, and making a real difference in people's lives. Join us in our mission to build a more caring and supportive society.
              </p>
            </div>
            <div className="flex justify-center">
              <img src={logo} alt="Welfare App Logo" className="w-64 h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Get In Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#688D48]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#688D48]" />
              </div>
              <p className="font-semibold text-lg mb-2">Email</p>
              <p className="text-gray-600">support@helpore.com</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#688D48]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#688D48]" />
              </div>
              <p className="font-semibold text-lg mb-2">Phone</p>
              <p className="text-gray-600">+91 9746483041</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-[#688D48]/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#688D48]" />
              </div>
              <p className="font-semibold text-lg mb-2">Address</p>
              <p className="text-gray-600">Kottakkal, Malappuram - 676508</p>
            </div>
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
              <img src={logo} alt="Welfare App Logo" className="h-8 w-auto mb-4 brightness-0 invert" />
              <p className="text-gray-400">
                We're dedicated to connecting those in need with those who can help.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white">
                    Contact
                  </button>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
                </li>
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