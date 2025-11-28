package com.example.famMedical.resolver;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.service.FamilyService;

@ExtendWith(MockitoExtension.class)
@DisplayName("FamilyResolver Tests")
public class FamilyResolverTest {

    @Mock
    private FamilyService familyService;

    @InjectMocks
    private FamilyResolver familyResolver;

    private Family family;
    private User headOfFamily;
    private Member member1;
    private Member member2;

    @BeforeEach
    public void setUp() {
        // Setup head of family
        headOfFamily = new User();
        headOfFamily.setUserID(1);
        headOfFamily.setEmail("head@example.com");
        headOfFamily.setFullName("Head of Family");
        headOfFamily.setRole(UserRole.ChuHo);

        // Setup family
        family = new Family();
        family.setFamilyID(100);
        family.setFamilyName("Test Family");
        family.setAddress("123 Test Street");
        family.setHeadOfFamily(headOfFamily);

        // Setup members
        member1 = new Member();
        member1.setMemberID(1);
        member1.setFullName("Member 1");
        member1.setFamily(family);

        member2 = new Member();
        member2.setMemberID(2);
        member2.setFullName("Member 2");
        member2.setFamily(family);

        family.setMembers(Arrays.asList(member1, member2));
    }

    @Nested
    @DisplayName("Basic Operations")
    class BasicOperationsTests {

        @Test
        @DisplayName("Should get all families")
        public void shouldGetAllFamilies() {
            // Arrange
            List<Family> expectedFamilies = Arrays.asList(family);
            when(familyService.getAllFamilies()).thenReturn(expectedFamilies);

            // Act
            List<Family> result = familyResolver.getAllFamilies();

            // Assert
            assertEquals(1, result.size());
            assertEquals(expectedFamilies, result);
            verify(familyService, times(1)).getAllFamilies();
        }

        @Test
        @DisplayName("Should get family by id - success")
        public void shouldGetFamilyById_Success() {
            // Arrange
            when(familyService.getFamilyById(100)).thenReturn(Optional.of(family));

            // Act
            Optional<Family> result = familyResolver.getFamilyById(100);

            // Assert
            assertTrue(result.isPresent());
            assertEquals(family.getFamilyID(), result.get().getFamilyID());
            verify(familyService, times(1)).getFamilyById(100);
        }

        @Test
        @DisplayName("Should get family by id - not found")
        public void shouldGetFamilyById_NotFound() {
            // Arrange
            when(familyService.getFamilyById(999)).thenReturn(Optional.empty());

            // Act
            Optional<Family> result = familyResolver.getFamilyById(999);

            // Assert
            assertFalse(result.isPresent());
            verify(familyService, times(1)).getFamilyById(999);
        }

        @Test
        @DisplayName("Should get family by head of family ID - GraphQL query")
        public void shouldGetFamilyByHeadOfFamilyID_GraphQL() {
            // Arrange
            when(familyService.getFamilyByHeadOfFamilyID(1)).thenReturn(family);

            // Act
            Family result = familyResolver.getFamilyByHeadOfFamilyID(1);

            // Assert
            assertNotNull(result);
            assertEquals(family.getFamilyID(), result.getFamilyID());
            assertEquals(family.getHeadOfFamily().getUserID(), result.getHeadOfFamily().getUserID());
            verify(familyService, times(1)).getFamilyByHeadOfFamilyID(1);
        }

        @Test
        @DisplayName("Should get family by head of family ID - null")
        public void shouldGetFamilyByHeadOfFamilyID_Null() {
            // Arrange
            when(familyService.getFamilyByHeadOfFamilyID(999)).thenReturn(null);

            // Act
            Family result = familyResolver.getFamilyByHeadOfFamilyID(999);

            // Assert
            assertNull(result);
            verify(familyService, times(1)).getFamilyByHeadOfFamilyID(999);
        }

        @Test
        @DisplayName("Should create family")
        public void shouldCreateFamily() {
            // Arrange
            Family newFamily = new Family();
            newFamily.setFamilyName("New Family");
            newFamily.setAddress("New Address");
            newFamily.setHeadOfFamily(headOfFamily);

            when(familyService.createFamily(any(Family.class))).thenReturn(newFamily);

            // Act
            Family result = familyResolver.createFamily(newFamily);

            // Assert
            assertNotNull(result);
            assertEquals("New Family", result.getFamilyName());
            verify(familyService, times(1)).createFamily(newFamily);
        }

        @Test
        @DisplayName("Should update family")
        public void shouldUpdateFamily() {
            // Arrange
            family.setFamilyName("Updated Family Name");
            when(familyService.updateFamily(any(Family.class))).thenReturn(family);

            // Act
            Family result = familyResolver.updateFamily(family);

            // Assert
            assertNotNull(result);
            assertEquals("Updated Family Name", result.getFamilyName());
            verify(familyService, times(1)).updateFamily(family);
        }

        @Test
        @DisplayName("Should delete family and return true")
        public void shouldDeleteFamily() {
            // Arrange
            doNothing().when(familyService).deleteFamily(100);

            // Act
            Boolean result = familyResolver.deleteFamily(100);

            // Assert
            assertTrue(result);
            verify(familyService, times(1)).deleteFamily(100);
        }
    }

    @Nested
    @DisplayName("Schema Mapping Tests")
    class SchemaMappingTests {

        @Test
        @DisplayName("Should calculate memberCount with members")
        public void shouldCalculateMemberCount_WithMembers() {
            // Act
            Integer result = familyResolver.memberCount(family);

            // Assert
            assertEquals(2, result);
        }

        @Test
        @DisplayName("Should return 0 when members is null")
        public void shouldReturnZeroWhenMembersIsNull() {
            // Arrange
            family.setMembers(null);

            // Act
            Integer result = familyResolver.memberCount(family);

            // Assert
            assertEquals(0, result);
        }

        @Test
        @DisplayName("Should return 0 when members is empty")
        public void shouldReturnZeroWhenMembersIsEmpty() {
            // Arrange
            family.setMembers(Arrays.asList());

            // Act
            Integer result = familyResolver.memberCount(family);

            // Assert
            assertEquals(0, result);
        }

        @Test
        @DisplayName("Should calculate memberCount with single member")
        public void shouldCalculateMemberCount_WithSingleMember() {
            // Arrange
            family.setMembers(Arrays.asList(member1));

            // Act
            Integer result = familyResolver.memberCount(family);

            // Assert
            assertEquals(1, result);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle empty list when getting all families")
        public void shouldHandleEmptyListWhenGettingAllFamilies() {
            // Arrange
            when(familyService.getAllFamilies()).thenReturn(Arrays.asList());

            // Act
            List<Family> result = familyResolver.getAllFamilies();

            // Assert
            assertTrue(result.isEmpty());
            verify(familyService, times(1)).getAllFamilies();
        }

        @Test
        @DisplayName("Should handle null family in memberCount")
        public void shouldHandleNullFamilyInMemberCount() {
            // Act & Assert
            assertThrows(NullPointerException.class, () ->
                familyResolver.memberCount(null)
            );
        }
    }
}

