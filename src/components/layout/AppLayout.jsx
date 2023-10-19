import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useCustomNavigate } from '../navigate/navigate';
import { useEffect,useState} from 'react';
import '../../assets/style/Layout.css'


const AppLayout = () => {
  const navigate = useCustomNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connection');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      navigate('/connection')
    }
  }, [])

  const isTokenExpired = (token) => {
    try {
      const parsedToken = JSON.parse(atob(token.split('.')[1]));
      const tokenExpiration = parsedToken.exp * 1000; // Convertir en millisecondes
      return Date.now() >= tokenExpiration;
    } catch (error) {
      console.error(error);
      return true; // Gérer les erreurs de décodage du token comme une expiration
    }
  };
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);


  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>

          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{
            "&:hover": {
              color: "hsl(24, 99%, 59%)",
            },
          }}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>
      <Sidebar setIsSidebarHovered={null} />
      {/* Contenu principal */}
      <div className="principale">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
