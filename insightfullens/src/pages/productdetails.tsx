import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

interface AspectSentimentCounts {
  [aspect: string]: { [sentiment: string]: number };
}

interface Product {
  id: number;
  name: string;
  reviews: string[];
  extracted_aspects: string[];
  aspect_sentiment_counts: AspectSentimentCounts;
  summary_text: string;
}

// Improved color scheme with better contrast and accessibility
const SENTIMENT_COLORS = {
  positive: "#4CAF50", // Green
  negative: "#F44336", // Red
  neutral: "#FFC107",  // Amber
  conflict: "#2196F3", // Blue
  "extremely negative": "#9C27B0" // Purple
};

// Custom tooltip component to replace the shadcn/ui tooltip
const CustomTooltip: React.FC<{
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}> = ({ children, content, side = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-default"
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-1.5 bg-gray-800 text-white text-sm rounded shadow-lg
            ${side === "top" ? "bottom-full mb-1 left-1/2 transform -translate-x-1/2" : ""}
            ${side === "bottom" ? "top-full mt-1 left-1/2 transform -translate-x-1/2" : ""}
            ${side === "left" ? "right-full mr-1 top-1/2 transform -translate-y-1/2" : ""}
            ${side === "right" ? "left-full ml-1 top-1/2 transform -translate-y-1/2" : ""}`
          }
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45
              ${side === "top" ? "top-full -mt-1 left-1/2 -ml-1" : ""}
              ${side === "bottom" ? "bottom-full -mb-1 left-1/2 -ml-1" : ""}
              ${side === "left" ? "left-full -ml-1 top-1/2 -mt-1" : ""}
              ${side === "right" ? "right-full -mr-1 top-1/2 -mt-1" : ""}`
            }
          ></div>
        </div>
      )}
    </div>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"alphabetical" | "mentions">("mentions");
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [highlightedAspect, setHighlightedAspect] = useState<string | null>(null);
  const [highlightedSentiment, setHighlightedSentiment] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/product/api/product/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Get all unique sentiment types from the data
  const sentimentTypes = useMemo(() => {
    if (!product) return [];
    
    const types = new Set<string>();
    Object.values(product.aspect_sentiment_counts).forEach(sentiments => {
      Object.keys(sentiments).forEach(sentiment => {
        types.add(sentiment);
      });
    });
    return Array.from(types);
  }, [product]);

  // Format data for bar chart
  const chartData = useMemo(() => {
    if (!product) return [];
    
    return Object.entries(product.aspect_sentiment_counts).map(
      ([aspect, sentiments]) => ({
        aspect,
        ...sentiments,
      })
    ).sort((a, b) => {
      // Sort by total mentions for each aspect (descending)
      const totalA = Object.values(a).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0) - 1; // subtract 1 to account for aspect property
      const totalB = Object.values(b).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0) - 1;
      return totalB - totalA;
    });
  }, [product]);

  // Aggregate sentiment counts for pie chart
  const { sentimentCounts, pieChartData, totalMentions } = useMemo(() => {
    if (!product) return { sentimentCounts: {}, pieChartData: [], totalMentions: 0 };
    
    const counts: { [sentiment: string]: number } = {};
    Object.values(product.aspect_sentiment_counts).forEach((sentiments) => {
      Object.entries(sentiments).forEach(([sentiment, count]) => {
        counts[sentiment] = (counts[sentiment] || 0) + (count as number);
      });
    });

    const pieData = Object.entries(counts).map(([sentiment, count]) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1), // Capitalize first letter
      value: count,
      color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || "#808080",
    }));

    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    
    return { 
      sentimentCounts: counts, 
      pieChartData: pieData,
      totalMentions: total
    };
  }, [product]);

  // Calculate totals for heatmap aspects
  const { aspectTotals, sortedAspects } = useMemo(() => {
    if (!product) return { aspectTotals: {}, sortedAspects: [] };
    
    const totals: { [aspect: string]: number } = {};

    Object.entries(product.aspect_sentiment_counts).forEach(([aspect, sentiments]) => {
      const total = Object.values(sentiments).reduce((sum, count) => sum + count, 0);
      totals[aspect] = total;
    });

    // Sort and filter aspects
    let sorted = Object.keys(product.aspect_sentiment_counts);
    
    if (sortBy === "mentions") {
      sorted = sorted.sort((a, b) => totals[b] - totals[a]);
    } else {
      sorted = sorted.sort((a, b) => a.localeCompare(b));
    }
    
    // Filter out aspects with too few mentions
    if (filterThreshold > 0) {
      sorted = sorted.filter(aspect => totals[aspect] >= filterThreshold);
    }
    
    return { 
      aspectTotals: totals, 
      sortedAspects: sorted 
    };
  }, [product, sortBy, filterThreshold]);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{label}</p>
          <div className="mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 mr-2 rounded-full" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <p className="text-sm">
                  {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: <span className="font-medium">{entry.value}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get color intensity for heatmap
  const getTextColor = (percentage: number) => {
    return percentage > 0.5 ? "text-white" : "text-gray-800";
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    if (value === 0) return "-";
    return `${Math.round(value * 100)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <div className="mt-4 text-gray-600 leading-relaxed">
            <h2 className="text-xl font-semibold mb-2">Product Summary</h2>
            <p>{product.summary_text}</p>
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Total Mentions</p>
              <p className="text-2xl font-bold">{totalMentions}</p>
            </div>
            {Object.entries(sentimentCounts).slice(0, 3).map(([sentiment, count]) => (
              <div 
                key={sentiment}
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: `${SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]}15`,
                  borderColor: `${SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]}30`
                }}
              >
                <p className="text-sm font-medium" style={{ color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] }}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Mentions
                </p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm mt-1">
                  {((count / totalMentions) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar Chart */}
          <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Aspect-Based Sentiment Analysis</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  barSize={24}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="aspect" 
                    tick={{ fontSize: 12 }} 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  {sentimentTypes.map((sentimentType) => {
                    const color = SENTIMENT_COLORS[sentimentType as keyof typeof SENTIMENT_COLORS] || "#808080";
                    
                    return (
                      <Bar
                        key={sentimentType}
                        dataKey={sentimentType}
                        stackId="a"
                        fill={color}
                        name={sentimentType.charAt(0).toUpperCase() + sentimentType.slice(1)}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Overall Sentiment Distribution</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} mentions (${((value as number / totalMentions) * 100).toFixed(1)}%)`, name]}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Improved Sentiment Heatmap */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold">Sentiment Heatmap</h2>
              <p className="text-gray-600 text-sm mt-1">
                Color intensity shows the proportion of each sentiment for each aspect.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center">
                <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 mr-2">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "alphabetical" | "mentions")}
                  className="py-1 px-3 border rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="mentions">Total mentions</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="filter-threshold" className="text-sm font-medium text-gray-700 mr-2">
                  Min mentions:
                </label>
                <input
                  id="filter-threshold"
                  type="number"
                  min="0"
                  value={filterThreshold}
                  onChange={(e) => setFilterThreshold(parseInt(e.target.value) || 0)}
                  className="w-16 py-1 px-3 border rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Color intensity legend */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Color intensity:</span>
            <div className="flex items-center">
              {[20, 40, 60, 80, 100].map((intensity) => (
                <CustomTooltip
                  key={intensity}
                  content={`${intensity}% of mentions`}
                  side="top"
                >
                  <div 
                    className="h-5 w-8 border-r border-white last:border-r-0" 
                    style={{ 
                      backgroundColor: `${SENTIMENT_COLORS.positive}`,
                      opacity: intensity / 100 
                    }}
                  ></div>
                </CustomTooltip>
              ))}
            </div>
          </div>

          {/* Responsive table wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
              <thead>
                <tr>
                  <th className="p-3 border bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 z-10">
                    Aspect / Sentiment
                  </th>
                  {sentimentTypes.map(sentiment => (
                    <th 
                      key={sentiment} 
                      className={`p-3 border text-center text-xs font-medium uppercase transition-colors duration-150
                        ${highlightedSentiment === sentiment ? 'bg-gray-100' : 'bg-gray-50'}`}
                      style={{ color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || "#666" }}
                      onMouseEnter={() => setHighlightedSentiment(sentiment)}
                      onMouseLeave={() => setHighlightedSentiment(null)}
                    >
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </th>
                  ))}
                  <th className="p-3 border bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAspects.length === 0 ? (
                  <tr>
                    <td colSpan={sentimentTypes.length + 2} className="p-4 text-center text-gray-500">
                      No aspects match the current filter criteria
                    </td>
                  </tr>
                ) : (
                  sortedAspects.map((aspect, index) => {
                    const sentiments = product.aspect_sentiment_counts[aspect];
                    const totalForAspect = aspectTotals[aspect];
                    const isHighlighted = highlightedAspect === aspect;
                    
                    return (
                      <tr 
                        key={aspect}
                        className={`transition-colors duration-150 ${isHighlighted ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onMouseEnter={() => setHighlightedAspect(aspect)}
                        onMouseLeave={() => setHighlightedAspect(null)}
                      >
                        <td className="p-3 border font-medium text-sm text-gray-900 sticky left-0 z-10 bg-inherit">
                          {aspect}
                        </td>
                        
                        {sentimentTypes.map(sentiment => {
                          const count = sentiments[sentiment] || 0;
                          const percentage = totalForAspect > 0 ? count / totalForAspect : 0;
                          const isHighlightedCell = isHighlighted || highlightedSentiment === sentiment;
                          const sentimentColor = SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || "#666";
                          
                          return (
                            <CustomTooltip
                              key={sentiment}
                              content={
                                count > 0 ? (
                                  <>
                                    <strong>{aspect}</strong>: {count} {sentiment} mentions<br/>
                                    ({formatPercentage(percentage)} of aspect mentions)
                                  </>
                                ) : (
                                  `No ${sentiment} mentions for ${aspect}`
                                )
                              }
                              side="top"
                            >
                              <td 
                                className={`p-3 border text-center transition-transform ${count > 0 ? "" : "text-gray-300"} 
                                  ${isHighlightedCell ? 'scale-105 z-20 shadow-sm' : ''}`}
                                style={{ 
                                  backgroundColor: count > 0 ? sentimentColor : "",
                                  opacity: count > 0 ? Math.max(0.2, percentage) : 0.05,
                                  color: getTextColor(percentage)
                                }}
                              >
                                {count > 0 ? (
                                  <span className="font-medium">{formatPercentage(percentage)}</span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </CustomTooltip>
                          );
                        })}
                        
                        <td className="p-3 border text-center font-medium text-sm">
                          {totalForAspect} 
                          <span className="text-xs text-gray-500 ml-1">
                            ({formatPercentage(totalForAspect / totalMentions)})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-medium">
                  <td className="p-3 border text-xs uppercase text-gray-700 sticky left-0 z-10 bg-gray-100">
                    All Aspects
                  </td>
                  {sentimentTypes.map(sentiment => {
                    let sentimentTotal = 0;
                    let percentage = 0;
                    
                    Object.values(product.aspect_sentiment_counts).forEach(counts => {
                      sentimentTotal += counts[sentiment] || 0;
                    });
                    
                    percentage = totalMentions > 0 ? sentimentTotal / totalMentions : 0;
                    
                    return (
                      <td 
                        key={sentiment} 
                        className="p-3 border text-center"
                        style={{ 
                          color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || "#666",
                        }}
                      >
                        <span className="font-bold">
                          {sentimentTotal} ({formatPercentage(percentage)})
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-3 border text-center font-bold">
                    {totalMentions}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Simple instructions for interaction */}
          <div className="mt-4 text-xs text-gray-500">
            <p>💡 Hover over cells for more details. Use the filters above to adjust the view.</p>
          </div>
        </div>

        {/* Detailed breakdown table */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Aspect Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aspect
                  </th>
                  {sentimentTypes.map(sentiment => (
                    <th key={sentiment} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(product.aspect_sentiment_counts).map(([aspect, sentiments], index) => {
                  // Calculate total mentions for this aspect
                  const total = Object.values(sentiments).reduce((sum, count) => sum + count, 0);
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aspect}
                      </td>
                      {sentimentTypes.map(sentiment => {
                        const count = sentiments[sentiment] || 0;
                        const percentage = total > 0 ? (count / total * 100).toFixed(0) : '0';
                        
                        return (
                          <td key={sentiment} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {count}
                            <span className="text-xs text-gray-400 ml-1">
                              ({percentage}%)
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review sample */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Review Samples ({product.reviews.length})</h2>
            <div className="space-y-4">
              {product.reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{review}</p>
                  {product.extracted_aspects[index] && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.extracted_aspects[index].split(', ').map((aspect, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {aspect}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;