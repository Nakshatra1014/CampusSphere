package com.campushub.repository;

import com.campushub.entity.Ride;
import com.campushub.entity.Ride.RideStatus;
import com.campushub.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByCreatorOrderByCreatedAtDesc(User creator);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Ride r WHERE r.id = :id")
    Optional<Ride> findByIdWithLock(@Param("id") Long id);

    
    @Query("SELECT r FROM Ride r WHERE r.status = :status AND " +
       "(r.rideDate > CURRENT_DATE OR " +
       "(r.rideDate = CURRENT_DATE AND r.rideTime > CURRENT_TIME)) AND " +
       "(:startLocation IS NULL OR LOWER(r.startLocation) LIKE LOWER(CONCAT('%', :startLocation, '%'))) AND " +
       "(:destination IS NULL OR LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
       "(:rideDate IS NULL OR r.rideDate = :rideDate) " +
       "ORDER BY r.rideDate ASC, r.rideTime ASC")
        List<Ride> searchRides(
        @Param("status") RideStatus status,
        @Param("startLocation") String startLocation,
        @Param("destination") String destination,
        @Param("rideDate") LocalDate rideDate
);

}
