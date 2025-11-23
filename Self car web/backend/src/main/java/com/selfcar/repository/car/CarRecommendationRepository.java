package com.selfcar.repository.car;

import com.selfcar.model.car.CarRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRecommendationRepository extends JpaRepository<CarRecommendation, Long> {
    List<CarRecommendation> findBySourceCarIdOrderBySimilarityScoreDesc(Long sourceCarId);
    
    List<CarRecommendation> findByUserIdOrderBySimilarityScoreDesc(Long userId);
    
    List<CarRecommendation> findByTargetCarIdAndClicked(Long targetCarId, Boolean clicked);
    
    @Query("SELECT cr FROM CarRecommendation cr WHERE cr.sourceCar.id = :carId AND cr.recommendationType = :type ORDER BY cr.similarityScore DESC")
    List<CarRecommendation> findBySourceCarAndType(@Param("carId") Long carId,
                                                    @Param("type") CarRecommendation.RecommendationType type);
}

