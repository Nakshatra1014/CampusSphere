package com.campushub.repository;

import com.campushub.entity.Ride;
import com.campushub.entity.RideBooking;
import com.campushub.entity.RideBooking.BookingStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideBookingRepository extends JpaRepository<RideBooking, Long> {
    Optional<RideBooking> findByRideAndPassenger(Ride ride, User passenger);
    Optional<RideBooking> findByRideAndPassengerAndStatus(Ride ride, User passenger, BookingStatus status);
    List<RideBooking> findByPassengerOrderByBookedAtDesc(User passenger);
    List<RideBooking> findByRideAndStatusOrderByBookedAtAsc(Ride ride, BookingStatus status);
    List<RideBooking> findByRideOrderByBookedAtAsc(Ride ride);
    boolean existsByRideAndPassengerAndStatus(Ride ride, User passenger, BookingStatus status);
}
