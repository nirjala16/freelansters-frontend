import FreelanstersLogo from "../assets/Freelansters.svg";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img
                src={FreelanstersLogo}
                alt="Freelansters Logo"
                className="h-10 w-10 rounded-xl p-1"
              />
              <span className="text-xl font-bold">Freelansters</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Connecting exceptional talent with innovative businesses
              worldwide.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">For Clients</h3>
            <ul className="space-y-3">
              {[
                "How to Hire",
                "Talent Marketplace",
                "Project Catalog",
                "Success Stories",
                "Enterprise Solutions",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-purple-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">For Freelancers</h3>
            <ul className="space-y-3">
              {[
                "How to Find Work",
                "Direct Contracts",
                "Getting Paid",
                "Community",
                "Skill Tests",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-purple-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                "Help & Support",
                "Success Stories",
                "Blog",
                "Community",
                "Affiliate Program",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-purple-600 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Freelansters. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Security", "Cookies", "Sitemap"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
        <div className="p-4 border-t gap-2 border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-center items-center">
          <span>By </span>
          <a
            href="https://soyambajgain.com.np"
            className="text-center text-muted-foreground hover:text-purple-600 transition-colors"
          >
            HEISENBERG
          </a>
        </div>
      </div>
    </footer>
  );
}
