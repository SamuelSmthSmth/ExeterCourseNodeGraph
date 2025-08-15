import React, { useEffect, useState } from 'react';
import { select, forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3';

const NodeGraph = ({ selectedCourse }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        const fetchData = async () => {
            if (selectedCourse) {
                const response = await fetch(`/api/courses/${selectedCourse}`);
                const data = await response.json();
                setGraphData(data);
            }
        };

        fetchData();
    }, [selectedCourse]);

    useEffect(() => {
        const svg = select('#node-graph');
        svg.selectAll('*').remove(); // Clear previous graph

        const width = 800;
        const height = 600;

        const simulation = forceSimulation()
            .force('link', forceLink().id(d => d.id).distance(100))
            .force('charge', forceManyBody().strength(-300))
            .force('center', forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graphData.links)
            .enter().append('line')
            .attr('stroke-width', 2)
            .attr('stroke', '#999');

        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graphData.nodes)
            .enter().append('circle')
            .attr('r', 5)
            .attr('fill', '#69b3a2')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        node.append('title')
            .text(d => d.id);

        simulation
            .nodes(graphData.nodes)
            .on('tick', ticked);

        simulation.force('link')
            .links(graphData.links);

        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }, [graphData]);

    return (
        <svg id="node-graph" width="800" height="600"></svg>
    );
};

export default NodeGraph;