import React from 'react';

const MuhuratTable = ({ data }) => {
    const renderTableRows = (data) => {
        return data.map((item, index) => (
            <tr key={index}>
                <td>{`${item.muhurat} - ${item.category}`}</td>
                <td>{item.time}</td>
            </tr>
        ));
    };

    return (
        <table id="muhurats-table" border="1" cellspacing="0" cellpadding="5">
            <thead>
                <tr>
                    <th>Muhurat and Category</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {renderTableRows(data)}
            </tbody>
        </table>
    );
};

export default MuhuratTable;
