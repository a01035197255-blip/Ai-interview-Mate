package io.github.seong5381.interviewMate.setting.repository;

import io.github.seong5381.interviewMate.setting.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettingRepository extends JpaRepository<Setting, Long> {

    List<Setting> findByUserId(Long userId);
}