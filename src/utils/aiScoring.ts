export const scoreAndRankProperties = (
    rawProperties: any[], 
    filters: { debBudget: number; debBeds: number; debBaths: number; debSqft: number }
) => {
    const { debBudget, debBeds, debBaths, debSqft } = filters;
    const austinAvgPricePsf = 300;

    return rawProperties.filter((property) => {
        if (debSqft > 0 && (!property.area || property.area < debSqft)) return false;
        if (debBeds > 0 && (!property.beds || property.beds < debBeds)) return false;
        return true;
    }).map((property: any) => {
        let aiScore = 0;
        let budgetRatio = 0;
        let pricePerSqft = 0;

        // 🤖 AI Factor 1: Smart Budget Analysis
        if (property.price && property.price <= debBudget) {
            budgetRatio = property.price / debBudget;
            if (budgetRatio >= 0.8 && budgetRatio <= 0.9) aiScore += 25;
            else if (budgetRatio < 0.8) aiScore += 20 + (0.8 - budgetRatio) * 10;
            else aiScore += 15;
        }

        // 🤖 AI Factor 2: Space Intelligence
        if (property.area && property.area >= debSqft) {
            const spaceRatio = property.area / debSqft;
            if (spaceRatio >= 1.2 && spaceRatio <= 1.4) aiScore += 20;
            else if (spaceRatio > 1.4) aiScore += 18;
            else aiScore += 15;
        }

        // 🤖 AI Factor 3: Layout Optimization
        if (property.beds && property.baths) {
            const bedroomBathRatio = property.beds / property.baths;
            if (bedroomBathRatio >= 1.5 && bedroomBathRatio <= 2.5) aiScore += 15;
            else aiScore += 10;
        }

        // 🤖 AI Factor 4: Market Value
        if (property.price && property.area && property.area > 0) {
            pricePerSqft = property.price / property.area;
            const marketEfficiency = (austinAvgPricePsf - pricePerSqft) / austinAvgPricePsf;
            if (marketEfficiency > 0.1) aiScore += 20;
            else if (marketEfficiency > 0) aiScore += 15;
            else if (marketEfficiency > -0.1) aiScore += 10;
            else aiScore += 5;
        }

        // 🤖 AI Factor 5 & 6: Investment & Lifestyle
        let investmentScore = 0;
        if (property.addressCity?.toLowerCase().includes('austin')) investmentScore += 5;
        if (property.area && property.area > 1000) investmentScore += 3;
        if (property.beds && property.beds >= 2) investmentScore += 2;
        aiScore += investmentScore;

        let lifestyleScore = 0;
        if (property.beds && property.beds > debBeds) lifestyleScore += Math.min((property.beds - debBeds) * 2, 5);
        if (property.baths && property.baths > debBaths) lifestyleScore += Math.min((property.baths - debBaths) * 2, 5);
        aiScore += lifestyleScore;

        if (property.score) aiScore += property.score * 20;

        const normalizedAiScore = Math.min(100, Math.max(0, aiScore));

        return {
            ...property,
            aiScore: Math.round(normalizedAiScore * 100) / 100,
            aiRankingFactors: {
                budgetAnalysis: budgetRatio ? Math.round((budgetRatio >= 0.8 && budgetRatio <= 0.9 ? 25 : 20) * 100) / 100 : 0,
                spaceIntelligence: property.area ? Math.round((property.area / debSqft >= 1.2 ? 20 : 15) * 100) / 100 : 0,
                layoutOptimization: property.beds && property.baths ? 15 : 0,
                marketValue: pricePerSqft ? Math.round(((austinAvgPricePsf - pricePerSqft) / austinAvgPricePsf > 0.1 ? 20 : 15) * 100) / 100 : 0,
                investmentPotential: investmentScore,
                lifestyleMatch: lifestyleScore
            }
        };
    }).sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0))
    .map((property: any, index: number) => ({
        ...property,
        rank: index + 1
    }));
};
