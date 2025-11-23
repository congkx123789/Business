package com.selfcar.repository.b2b;

import com.selfcar.model.b2b.EnterpriseUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnterpriseUserRepository extends JpaRepository<EnterpriseUser, Long> {
    List<EnterpriseUser> findByEnterpriseId(Long enterpriseId);
    List<EnterpriseUser> findByUserId(Long userId);
    List<EnterpriseUser> findByEnterpriseIdAndStatus(Long enterpriseId, EnterpriseUser.UserStatus status);
    EnterpriseUser findByEnterpriseIdAndUserId(Long enterpriseId, Long userId);
}

