"use client";
import { useState } from "react";
import {
  Github,
  Users,
  Code,
  GitFork,
  Star,
  Heart,
  ExternalLink,
} from "lucide-react";

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("mission");

  // const teamMembers = [
  //   {
  //     name: "MAS ASHIKUR RAHMAN HRIDOY",
  //     role: "Project Lead",
  //     image: "/api/placeholder/400/400",
  //     github: "https://github.com/b1ankZer0",
  //     bio: "Full-stack developer with 2+ years of experience in https://ticketmet.com/home.",
  //   },
  //   // {
  //   //   name: "Alex Johnson",
  //   //   role: "Core Developer",
  //   //   image: "/api/placeholder/400/400",
  //   //   github: "https://github.com/alexjohnson",
  //   //   bio: "Backend specialist focused on performance optimization and system architecture.",
  //   // },
  //   // {
  //   //   name: "Maria Garcia",
  //   //   role: "UI/UX Designer",
  //   //   image: "/api/placeholder/400/400",
  //   //   github: "https://github.com/mariagarcia",
  //   //   bio: "Creating beautiful and intuitive user experiences with accessibility in mind.",
  //   // },
  //   // {
  //   //   name: "David Kim",
  //   //   role: "DevOps Engineer",
  //   //   image: "/api/placeholder/400/400",
  //   //   github: "https://github.com/davidkim",
  //   //   bio: "Ensuring smooth deployments and maintaining infrastructure reliability.",
  //   // },
  // ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Our Project</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            An open source platform empowering developers to build amazing
            applications with simplicity and performance.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/b1ankZer0/SDLC"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub Repository
            </a>
            <a
              href="#get-started"
              className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Code className="h-5 w-5 mr-2" />
              Get Started
            </a>
          </div>

          <div className="mt-12 flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold">5,200+</div>
              <div className="text-blue-200">GitHub Stars</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">320+</div>
              <div className="text-blue-200">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">1.2M+</div>
              <div className="text-blue-200">Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("mission")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "mission"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Our Mission
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "team"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "community"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab("sponsors")}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "sponsors"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sponsors
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Mission Tab */}
          {activeTab === "mission" && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  We&apos;re building powerful, accessible tools that
                  democratize software development. Our mission is to create
                  technology that anyone can use, modify, and extend to build
                  their ideal solutions without barriers.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  By maintaining an open source approach, we ensure that our
                  software remains:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-800 mb-2">
                        Community-Driven
                      </h3>
                      <p className="text-gray-600">
                        Developed by the community, for the community, with
                        transparent decision-making.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <Code className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-800 mb-2">
                        Accessible
                      </h3>
                      <p className="text-gray-600">
                        Free to use and modify, with comprehensive documentation
                        for all skill levels.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <GitFork className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-800 mb-2">
                        Extensible
                      </h3>
                      <p className="text-gray-600">
                        Built with modularity in mind, allowing anyone to extend
                        functionality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-3 rounded-full mr-4">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-800 mb-2">
                        Quality-Focused
                      </h3>
                      <p className="text-gray-600">
                        Committed to high standards with rigorous testing and
                        continuous improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Our Story
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  The project began in 2020 when a small group of developers
                  recognized the need for a more accessible, performant
                  solution. What started as a weekend hackathon project quickly
                  grew into a vibrant community.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Today, our software powers thousands of applications across
                  the globe, from personal projects to enterprise solutions. We
                  remain committed to our founding principles of openness,
                  collaboration, and innovation.
                </p>
              </div>

              <div
                id="get-started"
                className="bg-blue-50 rounded-xl shadow-sm p-8 border border-blue-100"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Ready to dive in? Our comprehensive documentation and starter
                  templates make it easy to begin your journey.
                </p>
                <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 font-mono text-sm overflow-x-auto">
                  <code>git clone https://github.com/b1ankZer0/SDLC.git</code>
                </div>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/b1ankZer0/SDLC.git"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors duration-200"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Sponsor on GitHub
                  </a>
                  <a
                    href="https://github.com/b1ankZer0/SDLC.git"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors duration-200"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Open Source Philosophy */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Our Open Source Philosophy
            </h2>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  We believe in the power of open source to transform how
                  software is built and shared. Our commitment to open source
                  extends beyond just releasing code it about building a
                  sustainable ecosystem where everyone can participate,
                  contribute, and benefit.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                  Why Open Source Matters
                </h3>

                <p>
                  Open source creates a level playing field where innovation can
                  flourish without artificial barriers. It empowers developers
                  around the world to collaborate, learn from each other, and
                  build upon shared foundations.
                </p>

                <p>
                  By making our code freely available under the MIT license, we
                  ensure that:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>
                    Anyone can use our software for any purpose, including
                    commercial applications
                  </li>
                  <li>
                    The source code remains transparent and available for
                    inspection and learning
                  </li>
                  <li>
                    Developers can modify and adapt the code to their specific
                    needs
                  </li>
                  <li>Improvements can be shared back with the community</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                  Sustainable Open Source
                </h3>

                <p>
                  We&apos;re committed to building a sustainable open source
                  project that can thrive for years to come. This means
                  balancing community needs with the resources required for
                  ongoing maintenance and development.
                </p>

                <p>Our approach includes:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Transparent governance and decision-making processes</li>
                  <li>
                    Clear contribution guidelines to welcome new contributors
                  </li>
                  <li>
                    Sustainable funding through sponsorships and support options
                  </li>
                  <li>
                    Prioritizing documentation, testing, and long-term
                    maintenance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our project, contributions,
            and governance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              How can I contribute to the project?
            </h3>
            <p className="text-gray-600">
              We welcome contributions of all kinds! You can contribute code,
              improve documentation, report bugs, help with testing, or share
              your ideas for new features. Check our GitHub repository for
              issues labeled good first issue to get started.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              What license is the project under?
            </h3>
            <p className="text-gray-600">
              Our project is released under the MIT license, which means
              you&apos;re free to use, modify, and distribute it in both
              personal and commercial projects. We simply ask that you include
              the original copyright notice and license terms.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              How are decisions made about the project&apos;s direction?
            </h3>
            <p className="text-gray-600">
              We follow an open governance model where major decisions are
              discussed publicly in GitHub discussions or our community
              channels. The core team oversees the overall direction, but we
              heavily value community input and contributions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Can I use this in my commercial application?
            </h3>
            <p className="text-gray-600">
              Absolutely! The MIT license allows for commercial use. Many
              companies already use our software in production environments. If
              you need additional support or custom development, please reach
              out to discuss enterprise options.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join Our Open Source Community
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Whether you&apos;re a seasoned developer or just getting started,
            there&apos;s a place for you in our community. Join us in building
            the future of this project.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/b1ankZer0/SDLC.git"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Github className="h-5 w-5 mr-2" />
              Star on GitHub
            </a>
            <a
              href="https://github.com/b1ankZer0/SDLC.git"
              className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
