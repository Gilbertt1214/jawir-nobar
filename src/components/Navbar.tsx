import { Link } from 'react-router-dom';
import { Film, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link
                  to="/"
                  className="flex items-center gap-2 font-bold text-xl"
              >
                <img
                  src="/jawir-logo.png"
                  alt="Jawir | Kingdom of Wysteria"
                  className="h-8 w-8"
                />
                  <span className="hidden sm:inline">
                      Nobar bersama jawir
                  </span>
              </Link>

              <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md mx-4">
                  <form onSubmit={handleSearch} className="relative flex-1">
                      <Input
                          type="search"
                          placeholder="Search movies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10"
                      />
                      <Button
                          type="submit"
                          size="icon"
                          variant="ghost"
                          className="absolute right-0 top-0 h-full"
                      >
                          <Search className="h-4 w-4" />
                      </Button>
                  </form>
              </div>

              <div className="flex items-center gap-2">
                  <Link to="/genres">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:inline-flex"
                      >
                          Genres
                      </Button>
                  </Link>
                  {/* <Link to="/countries">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:inline-flex"
                      >
                          Countries
                      </Button>
                  </Link> */}
                  {/* <Link to="/years">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:inline-flex"
                      >
                          Years
                      </Button>
                  </Link> */}
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                  >
                      {theme === "light" ? (
                          <Moon className="h-5 w-5" />
                      ) : (
                          <Sun className="h-5 w-5" />
                      )}
                  </Button>
              </div>
          </nav>
      </header>
  );
}
