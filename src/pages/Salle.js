import React, { useState, useEffect } from 'react';
import { BiMessageSquareEdit } from 'react-icons/bi';
import { AiFillDelete } from 'react-icons/ai';
import '../assets/style/popup_erreur.css'
import ClipLoader from "react-spinners/ClipLoader";
import { AlertError, AlertSuccess } from "./Alert";
import Pagination from "./Pagination";
import { useNavigate } from 'react-router-dom';


const Salle = () => {
  const navigate =useNavigate();
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;


  const onNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const onPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const [nomSalle, setNomSalle] = useState('');
  const [capaciteSalle, setCapaciteSalle] = useState('');


  const [salle, setSalle] = useState([]);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const [alert_error, setAlert_error] = useState(false);
  const [alert_succes, setAlert_succes] = useState(false);

  const [color, setColors] = useState('')

  const colors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "gray", "black", "white"];

  const totalPages = Math.ceil(salle.length / recordsPerPage);
  const indexOfLastSalle = currentPage * recordsPerPage;
  const indexOfFirstSalle = indexOfLastSalle - recordsPerPage;
  const records = salle.slice(indexOfFirstSalle, indexOfLastSalle);
  const handleEdit = (salleID) => {
    const salles = salle.find((salle) => salle._id === salleID);
    setSelectedSalle(salles);
  };

  const closeAlert = () => {
    setAlert_error(false)
    setAlert_succes(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token  || isTokenExpired(token)) {
      navigate('/connection');
    } else {
      fetchSalle(token);
    }
    
    
    let errer404Timeout;
    let successTimeout;

    if (alert_error) {

      errer404Timeout = setTimeout(() => {
        setAlert_error(false);
      }, 10000);
    }

    if (alert_succes) {
      // Définir un délai de 5 secondes (5000 millisecondes) pour success
      successTimeout = setTimeout(() => {
        setAlert_succes(false);
      }, 10000);
    }

    // Nettoyer les délais lorsque le composant est démonté
    return () => {
      clearTimeout(errer404Timeout);
      clearTimeout(successTimeout);
    };
  }, [alert_error, alert_succes,navigate]);

  
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

  const fetchSalle = async (token) => {
    try {
      setLoading(true)
      const response = await fetch(`http://127.0.0.1:3001/salle`, {
        headers: {
          Authorization : token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSalle(data);
      } else {
        console.error('Erreur lors de la récupération des données de la salle');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleOnSubmit = async (e) => {
    e.preventDefault();
    let result = await fetch(`http://127.0.0.1:3001/salle`, {
      method: 'post',
      body: JSON.stringify({ nomSalle, capaciteSalle, couleurSalle: color }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (result.ok) {
      setNomSalle('');
      setCapaciteSalle('');
      setColors('');
      setSalle([...salle, result]);
      setAlert_succes(true);
    } else {
      setAlert_error(true);
    }
  };

  const handleDelete = async (salleID) => {
    try {
      await fetch(`http://127.0.0.1:3001/salle/${salleID}`, {
        method: 'delete',
      });
      const deletesalle = salle.filter((salles) => salles._id !== salleID);
      setSalle(deletesalle);
      alert('Salle supprimé avec succès');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (salleID) => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/salle/${salleID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomSalle, capaciteSalle, couleurSalle: color }),
      });

      if (response.ok) {
        // Mise à jour réussie, mettre à jour l'état ou effectuer d'autres actions nécessaires
        const updatedSalle = salle.map((salle) => {
          if (salle._id === salleID) {
            salle.nomSalle = nomSalle;
            salle.capaciteSalle = capaciteSalle;
            salle.couleurSalle = color;
          }
          return salle;
        });
        setSalle(updatedSalle);
      } else {
        // La mise à jour a échoué, gérer l'erreur
        console.error('Échec de la mise à jour');
      }
    } catch (error) {
      console.error(error);

    }
  };



  return (
    <div className="">
      <div className="card bg-light" style={{ width: '100%', height: '80vh', padding: '50px' }}>
        <div className="card-header text-center">
          <h1 className="card-text">Liste des salles</h1>
        </div>
        <div className="card-body text-center">

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '40vh', // Pour centrer verticalement sur toute la hauteur de la fenêtre
            }}><ClipLoader color="orange" size={80} /></div>
          ) : (
            <>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Capacité</th>
                    <th>Couleur</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="3">Aucune salle disponible pour le moment.</td>
                    </tr>
                  ) : (
                    records.map((salles) => (
                      <tr key={salles._id}>
                        <td>{salles.nomSalle}</td>
                        <td>{salles.capaciteSalle}</td>
                        <td>{salles.couleurSalle}</td>
                        <td>
                          <button className='edit bg-light' data-toggle="modal" data-target="#edit" onClick={() => handleEdit(salles._id)} >
                            <BiMessageSquareEdit />
                          </button>
                        { /* <button className='delete bg-light' onClick={() => handleDelete(salles._id)}> //COmmentatire bouton delete
                            <AiFillDelete />
                    </button>  */}
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>

          {  /*  <Pagination commentaire pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                onPageChange={onPageChange}
                  /> */}
            </>
          )}

          {alert_error && (
            <AlertError onClose={closeAlert} paragrapheText={<p>Nom de salle identique</p>} />
          )}

          {alert_succes && (
            <AlertSuccess onClose={closeAlert} paragrapheText={<p>Salle ajouter avec success</p>} />
          )}

        </div>
        <div className="d-flex mb-3 mr-3 ">
        { /* <div className="p-2 ml-auto  ">
            <button type="button" className="btn custom-btn ajouter" data-toggle="modal" data-target="#myModal">
              Ajouter
            </button> commenter bouton ajouter
          </div> */ }
        </div>
        <div className='popup'>
          <div className="modal fade" id="myModal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Ajouter Salle</h4>
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                </div>

                <div className="modal-body">
                  <form action="">
                    <div className="form-group">
                      <label htmlFor="Nom">Nom</label>
                      <input type="text" className="form-control" placeholder="Entrez le nom de salle"
                        id="nom"
                        value={nomSalle}
                        onChange={(e) => setNomSalle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="capacite">Capacité</label>
                      <input type="number" className="form-control" placeholder="Entrez la capacite" id="capacite"
                        value={capaciteSalle}
                        onChange={(e) => setCapaciteSalle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="color">Liste des colors</label>
                      <select className="form-control"
                        id="color"
                        onChange={(e) => setColors(e.target.value)}
                        value={color}
                      >
                        <option value="">Sélectionnez une couleur de votre choix</option>
                        {colors.map((couleur, index) => (
                          <option key={index} value={couleur}>
                            {couleur}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button type="submit" className="btn custom-btn ajouter" data-dismiss="modal" onClick={handleOnSubmit} >Enregistre</button>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn custom-btn annuler" data-dismiss="modal">Fermer</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='edit_popup'>
          {selectedSalle && (
            <div className="modal fade" id="edit">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">Ajouter Salle</h4>
                    <button type="button" className="close" data-dismiss="modal">&times;</button>
                  </div>

                  <div className="modal-body">
                    <form action="">
                      <div className="form-group">
                        <label htmlFor="Nom">Nom</label>
                        <input type="text" className="form-control" placeholder={selectedSalle.nomSalle}
                          id="nom"
                          value={nomSalle}
                          onChange={(e) => setNomSalle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="capacite">Capacité</label>
                        <input type="number" className="form-control" placeholder={selectedSalle.capaciteSalle} id="capacite"
                          value={capaciteSalle}
                          onChange={(e) => setCapaciteSalle(e.target.value)}
                          required
                        />
                      </div>


                      <div className="form-group">
                        <label htmlFor="color">Liste des colors</label>
                        <select className="form-control"
                          id="color"
                          onChange={(e) => setColors(e.target.value)}
                          value={color}
                        >
                          <option value="">Sélectionnez une couleur de votre choix</option>
                          {colors.map((couleur, index) => (
                            <option key={index} value={couleur}>
                              {couleur}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" className='btn custom-btn ajouter' data-dismiss="modal" onClick={() => handleUpdate(selectedSalle._id)}> Enregistre</button>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className='btn custom-btn annuler' data-dismiss="modal">Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>

  );
};

export default Salle;
