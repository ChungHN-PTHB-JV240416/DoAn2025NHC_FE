import React from 'react';

const ExampleCarouselImage = ({ text }) => {
    return (
        <div style={{ height: '400px', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d' }}>
            <h2>{text}</h2>
        </div>
    );
};

export default ExampleCarouselImage;