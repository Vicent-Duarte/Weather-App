import React, { useEffect, useState } from 'react';
import { getPaises } from '../services/getPaises';
import { getEstados } from '../services/getEstados';
import { getCiudades } from '../services/getCiudades';
import { getCiudadClima } from '../services/clima';
import { getAuth } from '../services/getAuth';
import './styles/SelectCity.css';

const SelectCity = ({ setClima, setErrorClima, }) => {
    const [paises, setPaises] = useState([])
    const [estados, setEstados] = useState([])
    const [ciudades, setCiudades] = useState([])
    const [authData, setAuthData] = useState(null)

    useEffect(() => {
        const fetchAuthData = async () => {
            try {
                const response = await getAuth();
                setAuthData(response.auth_token);
            } catch (error) {
                console.error('error', error)
            }
        };
        fetchAuthData();
    }, []);

    useEffect(() => {
        const fetchPaises = async () => {
            try {
                if (authData) {
                    const fetchedPaises = await getPaises(authData);
                    fetchedPaises.sort((a, b) => {
                        if (a.country_name < b.country_name) {
                            return -1;
                        }
                        if (a.country_name > b.country_name) {
                            return 1;
                        }
                        return 0;
                    });
                    setPaises(fetchedPaises)
                }
            } catch (error) {
                console.error('I did not find the Country', error);
            }
        };
        fetchPaises();
    }, [authData]);

    const paisHandler = async e => {
        e.currentTarget.value && setEstados([]);
        e.currentTarget.value && setCiudades([]);
        e.currentTarget.value && setEstados(await getEstados(e.currentTarget.value, authData));
        setClima(null);
        setErrorClima(null);
    };

    const estadoHandler = async e => {
        e.currentTarget.value && setCiudades([]);
        e.currentTarget.value && setCiudades(await getCiudades(e.currentTarget.value, authData));
        setClima(null);
        setErrorClima(null);
    };

    const ciudadHandler = async e => {
        try {
            e.currentTarget.value && setClima(await getCiudadClima(e.currentTarget.value));
            setErrorClima(null);
        } catch (error) {
            console.error('not found it', error);
            if (error.response && error.response.status === 404) {
                setErrorClima('I did not find the city 😨')
            } else {
                setErrorClima('Error')
            }
        }
    };


    return (
        <div className='select__container'>

            <div>
                <select className='select' onChange={paisHandler}>
                    <option value="">Select Country...</option>
                    {paises.map(pais => <option key={pais.country_short_name} value={pais.country_name}>{pais.country_name}</option>)}
                </select>

            </div>

            {estados.length > 0 && (
                <div>
                    <select className='select' onChange={estadoHandler}>
                        <option value="">Select State...</option>
                        {estados.map(estado => <option key={estado.state_name} value={estado.state_name}>{estado.state_name}</option>)}
                    </select>
                </div>)}

            {ciudades.length > 0 && (
                <div>
                    <select className='select' onChange={ciudadHandler}>
                        <option value="">Select City...</option>
                        {ciudades.map((ciudad, index) => <option key={index} value={ciudad.city_name}>{ciudad.city_name}</option>)}
                    </select>
                </div>)}
        </div>
    )
}

export default SelectCity;