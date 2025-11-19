import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Film className="h-6 w-6 text-primary" />
              <span>MovieHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for movies and series streaming.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/genres" className="text-muted-foreground hover:text-primary transition-smooth">
                  Genres
                </Link>
              </li>
              <li>
                <Link to="/countries" className="text-muted-foreground hover:text-primary transition-smooth">
                  Countries
                </Link>
              </li>
              <li>
                <Link to="/years" className="text-muted-foreground hover:text-primary transition-smooth">
                  Years
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Latest Movies
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  TV Series
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MovieHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
