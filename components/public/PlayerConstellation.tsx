'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  stats: {
    totalMatches: number;
    totalPoints: number;
    winRate: number;
  };
}

interface PlayerConstellationProps {
  players: Player[];
}

interface Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  photo: string | null;
  totalPoints: number;
  winRate: number;
  radius: number;
}

export default function PlayerConstellation({ players }: PlayerConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isMobile || players.length === 0) {
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.max(500, Math.min(800, width * 0.6));

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare nodes - size by total points
    const maxPoints = Math.max(...players.map(p => p.stats.totalPoints), 1);
    const minRadius = 20;
    const maxRadius = 50;

    const nodes: Node[] = players.map(player => ({
      id: player.id,
      name: player.name,
      photo: player.photo,
      totalPoints: player.stats.totalPoints,
      winRate: player.stats.winRate,
      radius: minRadius + (player.stats.totalPoints / maxPoints) * (maxRadius - minRadius),
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<Node>().radius(d => d.radius + 10))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Create node groups
    const nodeGroups = g.selectAll<SVGGElement, Node>('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any);

    // Add circles - color by performance (win rate)
    nodeGroups.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        if (d.winRate >= 60) return '#22c55e'; // Green for high win rate
        if (d.winRate >= 40) return '#3b82f6'; // Blue for medium win rate
        return '#f59e0b'; // Orange for lower win rate
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

    // Add player initials or photo
    nodeGroups.each(function(d: Node) {
      const group = d3.select(this);
      
      if (d.photo) {
        // Add clipPath for circular image
        const clipId = `clip-${d.id}`;
        svg.append('defs')
          .append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('r', d.radius - 3);

        group.append('image')
          .attr('href', d.photo)
          .attr('x', -(d.radius - 3))
          .attr('y', -(d.radius - 3))
          .attr('width', (d.radius - 3) * 2)
          .attr('height', (d.radius - 3) * 2)
          .attr('clip-path', `url(#${clipId})`)
          .style('pointer-events', 'none');
      } else {
        // Add initials
        group.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#fff')
          .attr('font-size', d.radius * 0.6)
          .attr('font-weight', 'bold')
          .style('pointer-events', 'none')
          .text(d.name.charAt(0).toUpperCase());
      }
    });

    // Add labels below nodes
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => d.radius + 15)
      .attr('fill', '#374151')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    // Add hover effects
    nodeGroups
      .on('mouseenter', function(event, d) {
        setHoveredPlayer(d.id);
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.1)
          .attr('stroke-width', 4);
      })
      .on('mouseleave', function(event, d) {
        setHoveredPlayer(null);
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .attr('stroke-width', 3);
      })
      .on('click', function(event, d) {
        router.push(`/players/${d.id}`);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragStarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [players, isMobile, router]);

  // Mobile list view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">📱 Mobile View</p>
          <p>The interactive constellation view is available on larger screens. Here's a list of all players.</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => router.push(`/players/${player.id}`)}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
            >
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{player.name}</h3>
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  <span>Points: {player.stats.totalPoints}</span>
                  <span>Win Rate: {player.stats.winRate.toFixed(1)}%</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🌟</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No players to display
        </h3>
        <p className="text-gray-600">
          Add players to see the constellation view
        </p>
      </div>
    );
  }

  // Desktop constellation view
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🌟</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Player Constellation</h3>
            <p className="text-sm text-gray-600">
              Explore player relationships and performance. Node size represents total points, 
              color indicates win rate (🟢 High, 🔵 Medium, 🟠 Lower). 
              Drag to rearrange, scroll to zoom, click to view profile.
            </p>
          </div>
        </div>
      </div>

      {hoveredPlayer && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          {(() => {
            const player = players.find(p => p.id === hoveredPlayer);
            if (!player) return null;
            return (
              <div className="flex items-center gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <p className="font-semibold text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-600">
                    {player.stats.totalPoints} points • {player.stats.winRate.toFixed(1)}% win rate
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div 
        ref={containerRef} 
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      >
        <svg ref={svgRef} className="w-full" />
      </div>

      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>High Win Rate (≥60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Medium Win Rate (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span>Lower Win Rate (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
}
