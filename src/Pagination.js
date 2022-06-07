import './Pagination.css';
import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE = 1;
const PAGE_SIZE = 20;
const NUM_SELECTABLE_PAGES = 7;

function Pagination(props) {
  const [pageOffset, setPageOffset] = useState(0);
  const [pageLastElement, setPageLastElement] = useState(0);
  const [numResults, setNumResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [numPages, setNumPages] = useState(1);
  const [paginationDots, setPaginationDots] = useState([]);

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      changePage(currentPage);
      mounted.current = true;
    }
  });

  function changePage(pageToLoad) {
    props.loadPage(pageToLoad, PAGE_SIZE).then(responseObject => loadPageCallback(pageToLoad, responseObject));
  }

  function loadPageCallback(pageToLoad, responseObject) {
    if (responseObject != null) {
      setPageOffset(responseObject.pageOffset + 1);
      setPageLastElement(responseObject.pageOffset + responseObject.resultList.length);
      setNumResults(responseObject.numResults);
      setCurrentPage(pageToLoad)
      setNumPages(responseObject.numPages);

      scrollTop();
      calculatePaginator(responseObject.numPages, pageToLoad);
    }
  }

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function calculatePaginator(responseNumPages, responseCurrentPage) {
    let totalPages = responseNumPages;
    let auxCurrentPage = responseCurrentPage;
    let firstPaginatorPage = 0;
    let lastPaginatorPage = 0;

    if (totalPages < DEFAULT_PAGE) {
      totalPages = DEFAULT_PAGE;
    }
    if (auxCurrentPage < DEFAULT_PAGE || auxCurrentPage > totalPages) {
      auxCurrentPage = DEFAULT_PAGE;
    }

    if (totalPages <= NUM_SELECTABLE_PAGES) {
      firstPaginatorPage = DEFAULT_PAGE;
      lastPaginatorPage = totalPages;
    } else {
      firstPaginatorPage = Math.ceil(auxCurrentPage - NUM_SELECTABLE_PAGES / 2);
      lastPaginatorPage = parseInt(auxCurrentPage + NUM_SELECTABLE_PAGES / 2);
      if (firstPaginatorPage < DEFAULT_PAGE) {
        while (firstPaginatorPage < DEFAULT_PAGE) {
          ++firstPaginatorPage;
          ++lastPaginatorPage;
        }
      } else if (lastPaginatorPage > totalPages) {
        while (lastPaginatorPage > totalPages) {
          --firstPaginatorPage;
          --lastPaginatorPage;
        }
      }
    }

    let auxPages = [];
    for (let index = firstPaginatorPage; index <= lastPaginatorPage; ++index) {
      auxPages.push(<button key={index} className={'pageDot' + (auxCurrentPage === index ? ' currentDot' : '')} onClick={() => changePage(index)}>{index}</button>);
    }
    setPaginationDots(auxPages);
  }

  return (
    <div className="pagination">
      <p className="paginationInfo">
        <span>{pageOffset} - {pageLastElement} of {numResults} {numResults > 1 ? 'results' : 'result'} | {currentPage} - {numPages} pages</span>
      </p>

      <div className="paginationDots">
        <button className={'arrowDot' + (currentPage > 1 ? '' : ' disabled')} onClick={() => changePage(currentPage - 1)}>&lt;</button>
        {paginationDots}
        <button className={'arrowDot' + (currentPage < numPages ? '' : ' disabled')} onClick={() => changePage(currentPage + 1)}>&gt;</button>
      </div>
    </div>
  );
}

export default Pagination;
