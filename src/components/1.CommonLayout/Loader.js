import React from 'react'

const Loader = () => {
    return (
        <div className='text-center min-100vh d-flex justify-content-center align-items-center'>
            <h1 className='loader-color me-3'>Please Wait... </h1>
            <div className="spinner-border loader-color  " style={{ width: "2rem", height: "2rem" }} role="status">
                <span className="sr-only "> Loading...</span>
            </div>
        </div>
    )
}

export default Loader