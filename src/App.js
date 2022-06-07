import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import Pagination from './Pagination';
import Loading from './loading.gif';

const STATUS_OPTIONS = ['ALL', 'CANCELED', 'COMPLETED', 'ERROR'];
const COLUMNS = [{ name: 'id', label: 'ID' }, { name: 'name', label: 'Name' }, { name: 'status', label: 'Status' }, { name: 'description', label: 'description' }, { name: 'delta', label: 'Delta' }, { name: 'createdOn', label: 'Created On' }]
const SORTABLE_FIELDS = ['id', 'name', 'createdOn'];
const SORTABLE_OPTIONS = ['ASC', 'DESC'];

const SERVER_URL = 'http://localhost:8080/king-data';

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elementList, setElementList] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemStatus, setItemStatus] = useState(STATUS_OPTIONS[0]);
  const [sorting, setSorting] = useState({
    sortField: SORTABLE_FIELDS[0],
    sortDirection: SORTABLE_OPTIONS[0]
  });

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current || itemName !== mounted.previousName || itemStatus !== mounted.previousStatus
      || sorting.sortField !== mounted.previousSortField || sorting.sortDirection !== mounted.previousSortDirection) {
      if (!mounted.current) {
        mounted.current = true;
      } else {
        loadPage(mounted.pageToLoad, mounted.pageSize);
      }

      mounted.previousName = itemName;
      mounted.previousStatus = itemStatus;
      mounted.previousSortField = sorting.sortField;
      mounted.previousSortDirection = sorting.sortDirection;
    }
  });

  async function loadPage(pageToLoad, pageSize) {
    setLoading(true);
    mounted.pageToLoad = pageToLoad;
    mounted.pageSize = pageSize;

    const options = {
      method: 'GET'
    }
    let serviceUrl = SERVER_URL + '?page=' + mounted.pageToLoad + '&pageSize=' + mounted.pageSize + '&sortField=' + sorting.sortField
      + '&sortDirection=' + sorting.sortDirection;
    if (itemName !== '') {
      serviceUrl += '&name=' + itemName;
    }
    if (itemStatus !== STATUS_OPTIONS[0]) {
      serviceUrl += '&status=' + itemStatus;
    }

    return fetch(serviceUrl, options)
      .then(response => {
        if (response.status === 200) {
          return response.text();
        } else {
          setLoading(false);
          setError("Can't get data from server");
          return null;
        }
      }).then(text => {
        const responseObject = JSON.parse(text);
        setElementList(responseObject.resultList);
        setLoading(false);
        return responseObject;
      }).catch(err => {
        setLoading(false);
        setError("Can't get data from server");
        return null;
      });
  }

  function sortField(fieldName) {
    let sortDirection;
    if (sorting.sortField === fieldName) {
      if (sorting.sortDirection === SORTABLE_OPTIONS[0]) {
        sortDirection = SORTABLE_OPTIONS[1];
      } else {
        sortDirection = SORTABLE_OPTIONS[0];
      }
    } else {
      sortDirection = SORTABLE_OPTIONS[0];
    }
    setSorting({
      sortField: fieldName,
      sortDirection: sortDirection
    })
  }


  return (
    <div className="App">
      {error != null ?
        <h2 className='centered'>{error}</h2>
        :
        <div className="container">
          <div className="filterRow">
            <div className="filterField">
              <span>Name: </span>
              <input type="text" value={itemName} onChange={event => setItemName(event.target.value)} />
            </div>

            <div className="filterField">
              <span>Status: </span>
              <select value={itemStatus} onChange={event => setItemStatus(event.target.value)}>
                {STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                {COLUMNS.map(column =>
                  <th key={column.name}>
                    <button className={SORTABLE_FIELDS.includes(column.name) ? 'cPointer' : 'unclickable'} onClick={() => sortField(column.name)}>
                      {column.label} {sorting.sortField === column.name ? <p className={SORTABLE_OPTIONS[0] === sorting.sortDirection ? ' rotateDown' : ' rotateUp'}>&gt;</p> : null}
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {elementList.length === 0 ?
                <tr><td colSpan={6}>There are no data to show.</td></tr>
                :
                null}
              {elementList.map(element =>
                <tr key={element.id}>
                  <td>{element.id}</td>
                  <td>{element.name}</td>
                  <td>{element.status}</td>
                  <td>{element.description}</td>
                  <td>{element.delta}</td>
                  <td>{element.createdOn}</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination loadPage={loadPage} />

          {loading ?
            <div className="pageLoadingLayout">
              <img src={Loading} className="loading" alt="Loading" />
            </div>
            :
            null
          }
        </div>

      }
    </div>
  );
}

export default App;
