import { useState, useEffect, useContext, useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProviderContext } from "@/components/theme-context";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Icons
import {
  Menu,
  Moon,
  Sun,
  User,
  LayoutDashboard,
  LogOut,
  Briefcase,
  Users,
  Info,
  Home,
  MessageSquare,
  HelpCircle,
  X,
  Wallet,
  Bell,
} from "lucide-react";

// Assets
import FreelanstersLogo from "../assets/Freelansters.svg";

const mainNavItems = [
  { id: "home", href: "/", label: "Home", icon: Home },
  {
    id: "browse-jobs",
    href: "/browse-jobs",
    label: "Browse Jobs",
    icon: Briefcase,
  },
  {
    id: "freelancers",
    href: "/freelancers",
    label: "Hire Freelancers",
    icon: Users,
  },
  { id: "clients", href: "/clients", label: "Find Clients", icon: Briefcase },
  { id: "about", href: "/about", label: "About", icon: Info },
];

// Memoized Components
import PropTypes from "prop-types";

const MemoizedListItem = memo(
  ({ title, description, icon: Icon, badge, href }) => (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <div className="text-sm font-medium leading-none">{title}</div>
            {badge && (
              <Badge
                variant={badge === "Hot" ? "destructive" : "secondary"}
                className="ml-2"
              >
                {badge}
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
);

MemoizedListItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  badge: PropTypes.string,
  href: PropTypes.string.isRequired,
};
MemoizedListItem.displayName = "MemoizedListItem";

const ThemeToggle = memo(({ theme, onToggle }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-full"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
ThemeToggle.propTypes = {
  theme: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};
ThemeToggle.displayName = "ThemeToggle";

export default function Navbar({ notifications }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeProviderContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("session");
    setUser(null);
    navigate("/login");
    toast.success("You have been logged out successfully", {
      description: "We hope to see you again soon!",
      action: {
        label: "Login",
        onClick: () => navigate("/login"),
      },
    });
  }, [navigate]);

  // Effects
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = localStorage.getItem("session");
        if (session) {
          const parsedSession = JSON.parse(session);
          setUser(
            parsedSession.user ? parsedSession.user : parsedSession.admin
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Component functions
  const NavLinks = () => (
    <NavigationMenu>
      <NavigationMenuList>
        {mainNavItems.map((item) => (
          <NavigationMenuItem key={item.id}>
            <Link to={item.href} className={navigationMenuTriggerStyle()}>
              {item.label}
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const UserMenu = () => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
            aria-label="User menu"
          >
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarImage
                src={user?.profilePic}
                alt={user?.name || "User"}
                className="object-cover"
              />
              <AvatarFallback className="uppercase bg-primary/10 text-primary">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[280px] p-2"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage
                  src={user?.profilePic}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="uppercase bg-primary/10 text-primary">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
                {user?.dateJoined && (
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(user.dateJoined)}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to="/profile">
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" /> Profile
              <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link to="/dashboard">
            <DropdownMenuItem className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
              <DropdownMenuShortcut>⇧D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          {user?.role == "freelancer" && (
            <Link to="/wallet">
              <DropdownMenuItem className="gap-2">
                <Wallet className="h-4 w-4" /> Wallet
                <DropdownMenuShortcut>⇧W</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <img
                src={FreelanstersLogo || "/placeholder.svg"}
                alt="Freelansters"
                className="h-8 w-auto"
              />
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>
            Find the perfect job or talent for your next project
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-4">
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === item.href
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="relative py-4 mt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Job Categories
                </span>
              </div>
            </div>

            <div className="relative py-4 mt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Help & Support
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                to="/help"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t flex-row justify-between">
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.profilePic}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium truncate max-w-[120px]">
                {user?.name || "User"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 shadow-md"
          : "bg-white/80 dark:bg-gray-900/80 py-5"
      }`}
    >
      <nav className="container flex h-8 items-center">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={FreelanstersLogo}
              alt="Freelansters"
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden lg:flex">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/notification" className="relative">
            <Bell className="h-4 w-4 text-gray-600 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />

          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <MobileNav />
        </div>
      </nav>
    </header>
  );
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center">
        <div className="flex items-center gap-8 flex-1">
          <Skeleton className="h-8 w-32" />
          <div className="hidden lg:flex gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="hidden md:block ml-4">
            <Skeleton className="h-9 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </nav>
    </header>
  );
}

Navbar.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["info", "success", "warning", "error"]).isRequired,
      link: PropTypes.string,
      isRead: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
};
