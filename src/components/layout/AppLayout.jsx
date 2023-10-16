import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { AppBar, Toolbar, Typography, Button } from "@mui/material"; 
import { useCustomNavigate  } from '../navigate/navigate'; // Assurez-vous de spécifier le chemin correct vers votre fichier navigation.js
import { useEffect } from 'react';


const AppLayout = () => {
  const navigate = useCustomNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connection');
  };

  useEffect (()=>{
    const token = localStorage.getItem('token');
    if(!token  || isTokenExpired(token)){
      navigate('/connection')
    }
  },[navigate])
  
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

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           Orange digital center
          </Typography>
          <Button color="inherit" onClick={handleLogout}  sx={{
              "&:hover": {
                color: "hsl(24, 99%, 59%)",
              },
            }}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenu principal */}
      <div
        style={{
          padding: "40px 0px 10px 18%",
          marginRight: "10px",
          color:'black',
    
        }}
      >
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
