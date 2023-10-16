import './App.scss';
import 'boxicons/css/boxicons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './assets/style/button.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Deconnection from './pages/Deconnection.jsx';
import Acceuil from './pages/Acceuil.tsx';
import Salle from './pages/Salle'
import Reservation from './pages/Reservation'
import ReservationDetails from './pages/ReservationDetails';
import Notfound from './pages/Notfound';
import Connection from './pages/Connection.js';
import Map from './pages/Map';
import Test from './pages/Test';
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='*' element={<Notfound />} />
                <Route path='/deconnection' element={<Deconnection />} />
                <Route path='/connection' element={<Connection />} />
                <Route path='/' element={<AppLayout />}>
                    <Route index element={<Acceuil />} />
                    <Route path='/acceuil' element={<Acceuil />} />
                    <Route path='/salle' element={<Salle />} />
                    <Route path='/reservation' element={<Reservation />} />
                    <Route path='/reservation/:id' element={<ReservationDetails />} />
                    <Route path='/map' element={<Map/>} />
                    <Route path='/test' element={<Test/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
