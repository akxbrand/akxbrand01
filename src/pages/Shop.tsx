import React, { useState, useEffect } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

interface Category {
	id: string;
	name: string;
	count: number;
	subcategories?: Subcategory[];
}

interface Subcategory {
	id: string;
	name: string;
	count: number;
}

const Shop = () => {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [sortBy, setSortBy] = useState('newest');
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [products, setProducts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [totalProducts, setTotalProducts] = useState(0);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const params = new URLSearchParams();
				if (searchQuery) params.set('search', searchQuery);
				if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
				if (sortBy) params.set('sortBy', sortBy);

				const response = await fetch(`/api/products?${params.toString()}`);
				const data = await response.json();
				if (!response.ok) throw new Error(data.error);

				setProducts(data.products);
				setTotalProducts(data.total);
			} catch (error) {
				console.error('Error fetching products:', error);
			}
		};

		fetchProducts();
	}, [searchQuery, selectedCategories, sortBy]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch('/api/categories');
				const data = await response.json();
				if (!response.ok) throw new Error(data.error);
				setCategories(data.categories);
			} catch (error) {
				console.error('Error fetching categories:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, []);

	const handleCategoryChange = (categoryId: string) => {
		setSelectedCategories(prev =>
			prev.includes(categoryId)
				? prev.filter(c => c !== categoryId)
				: [...prev, categoryId]
		);
	};

	const handleSubcategoryChange = (subcategoryId: string) => {
		setSelectedSubcategories(prev =>
			prev.includes(subcategoryId)
				? prev.filter(s => s !== subcategoryId)
				: [...prev, subcategoryId]
		);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header Section */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<span className="text-gray-600">{totalProducts} Products</span>
					<div className="flex items-center gap-2">
						<span>Sort by:</span>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="border rounded-md p-1"
						>
							<option value="newest">Newest</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
						</select>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setViewMode('grid')}
						className={`p-2 ${viewMode === 'grid' ? 'text-green-500' : 'text-gray-400'}`}
					>
						<FiGrid size={20} />
					</button>
					<button
						onClick={() => setViewMode('list')}
						className={`p-2 ${viewMode === 'list' ? 'text-green-500' : 'text-gray-400'}`}
					>
						<FiList size={20} />
					</button>
				</div>
			</div>

			<div className="mb-6">
				<SearchBar
					onSearch={(query) => setSearchQuery(query)}
					className="max-w-md mx-auto"
				/>
			</div>

			<div className="flex gap-8">
				{/* Filters Section */}
				<div className="w-64 flex-shrink-0">
					<div className="mb-6">
						<h3 className="font-semibold mb-4">Filters</h3>
						<button className="text-sm text-gray-600">Clear All</button>
					</div>

					{/* Price Range */}
					<div className="mb-6">
						<h4 className="font-medium mb-3">Price Range</h4>
						<div className="flex gap-2 items-center">
							<input type="number" placeholder="₹0" className="w-24 p-2 border rounded" />
							<span>to</span>
							<input type="number" placeholder="₹50,000" className="w-24 p-2 border rounded" />
						</div>
					</div>


				</div>

				{/* Categories and Subcategories */}
				<div className="mb-6">
					<h4 className="font-medium mb-3">Categories</h4>
					<div className="space-y-2">
						{categories.map((category) => (
							<div key={category.id} className="space-y-1">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={selectedCategories.includes(category.id)}
										onChange={() => handleCategoryChange(category.id)}
									/>
									{category.name}
									<span className="text-gray-500">({category.count})</span>
								</label>
								{selectedCategories.includes(category.id) && category.subcategories && (
									<div className="ml-6 space-y-1">
										{category.subcategories.map((subcategory) => (
											<label key={subcategory.id} className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={selectedSubcategories.includes(subcategory.id)}
													onChange={() => handleSubcategoryChange(subcategory.id)}
												/>
												{subcategory.name}
												<span className="text-gray-500">({subcategory.count})</span>
											</label>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>


			<div className="flex-1">
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64">
						<p className="text-xl text-gray-600 mb-4">No products found</p>
						{searchQuery && (
							<button
								onClick={() => router.push('/shop')}
								className="text-blue-600 hover:text-blue-800"
							>
								View all products
							</button>
						)}
					</div>
				) : (
					<div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
						{filteredProducts.map((product) => (
							<ProductCard
								key={product.id}
								title={product.name}
								price={product.price}
								image={product.images[0]}
								rating={product.rating}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	
	
	);
};

export default Shop;