import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/api';

const ItemListPage = () => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');

    useEffect(() => {
        const fetchItems = async () => {
            const data = await getItems(searchTerm, searchField);
            setItems(data);
        };
        const debounce = setTimeout(fetchItems, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, searchField]);

    return (
        <div>
            {/* The toolbar is where we will add the new button */}
            <div className="toolbar">
                {/* NEW: A wrapper div for the buttons to group them */}
                <div className="toolbar-actions">
                    {/* NEW: The button to go back to the Dashboard */}
                    <Link to="/" className="button-link">
                        &#8592; Required Item
                    </Link>
                    <Link to="/new" className="button-link">
                        + Register New Item
                    </Link>
                </div>

                {/* The search group remains unchanged */}
                <div className="search-group">
                    <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="search-select"
                    >
                        <option value="all">All Fields</option>
                        <option value="item_name">Item Name</option>
                        <option value="qr_number">QR Number</option>
                        <option value="provisional_asset_number">Provisional/Final Asset No.</option>
                        <option value="document_number">Document No.</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="item-list">
                {items.length > 0 ? items.map(item => (
                    <Link key={item._id} to={`/edit/${item._id}`} className="item-card-link">
                        <div className="item-card">
                            <h3>{item.item_name}</h3>
                            <p><strong>Doc #:</strong> {item.document_number}</p>
                            <p><strong>Date:</strong> {new Date(item.purchase_date).toLocaleDateString()}</p>
                            <p><strong>Location:</strong> {item.storage_location || 'N/A'}</p>
                        </div>
                    </Link>
                )) : (
                    <p>No items found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default ItemListPage;